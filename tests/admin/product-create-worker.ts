import { onRequest as adminProductsRoute } from '../../functions/api/admin/produtos.ts'
import { onRequest as publicProductsRoute } from '../../functions/api/produtos.ts'
import { createSessionCookie } from '../../server/auth/sessionCookie.ts'
import {
  createSessionToken,
  hashSessionToken,
} from '../../server/auth/sessionToken.ts'

type Env = {
  DB: D1Database
}

function check(
  condition: boolean,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Use POST.', {
        status: 405,
        headers: { Allow: 'POST' },
      })
    }

    const db = env.DB
    const origin = 'https://admin.example'
    const token = createSessionToken()
    const tokenHash = await hashSessionToken(token)
    const suffix = tokenHash.slice(0, 16)
    const administratorId = `admin-product-${suffix}`
    const productName = `TESTE Rascunho ${suffix}`
    const cookie = createSessionCookie(token).split(';')[0]
    const results: string[] = []

    const input = {
      nome: `  ${productName}  `,
      colecao_slug: 'essencia',
      material_slug: 'perolas',
      descricao: 'Descrição de teste. '.repeat(150),
    }

    async function send(
      body: Record<string, unknown>,
      includeCookie = true,
      sourceOrigin = origin,
    ): Promise<Response> {
      const headers = new Headers({
        Origin: sourceOrigin,
        'Content-Type': 'application/json',
        'X-Atelie-Admin': '1',
      })

      if (includeCookie) headers.set('Cookie', cookie)

      const testRequest = new Request(
        `${origin}/api/admin/produtos`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        },
      )

      return adminProductsRoute({
        request: testRequest,
        env: { DB: db, ADMIN_ORIGIN: origin },
      } as Parameters<typeof adminProductsRoute>[0])
    }

    async function expectStatus(
      response: Response,
      expected: number,
    ): Promise<void> {
      check(
        response.status === expected,
        `Esperado HTTP ${expected}, recebido ${response.status}.`,
      )
      check(
        response.headers.get('Cache-Control') === 'no-store',
        'Resposta sem proteção de cache.',
      )
    }

    try {
      const now = Math.floor(Date.now() / 1000)

      await db.prepare(`
        INSERT INTO administradores (
          id, nome, usuario, email_firebase, firebase_uid, ativo
        ) VALUES (?, ?, ?, ?, ?, 1)
      `).bind(
        administratorId,
        'Administrador fictício',
        `produto.${suffix}`,
        `${suffix}@example.invalid`,
        `firebase-product-${suffix}`,
      ).run()

      await db.prepare(`
        INSERT INTO sessoes_administrativas (
          token_hash, administrador_id,
          criado_em, ultima_atividade_em, expira_em
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        tokenHash,
        administratorId,
        now,
        now,
        now + 86400,
      ).run()

      await expectStatus(await send(input, false), 401)
      results.push('Cadastro sem sessão recusado.')

      await expectStatus(
        await send(input, true, 'https://outro.example'),
        403,
      )
      results.push('Cadastro de outra origem recusado.')

      for (const extra of [
        { status: 'publicado' },
        { preco: 100 },
        { id: 'id-enviado-pelo-cliente' },
      ]) {
        await expectStatus(await send({ ...input, ...extra }), 400)
      }
      results.push('Status, preço e identificador enviados pelo cliente recusados.')

      await expectStatus(
        await send({ ...input, material_slug: 'madeira' }),
        400,
      )
      results.push('Coleção e material incompatíveis recusados.')

      await expectStatus(
        await send({
          ...input,
          colecao_slug: 'infantil',
          material_slug: 'perolas',
        }),
        400,
      )
      results.push('Coleção Infantil desativada recusada.')

      const createdResponse = await send(input)
      await expectStatus(createdResponse, 201)

      const created = await createdResponse.json() as {
        produto: {
          id: string
          nome: string
          slug: string
          status: string
        }
      }

      check(
        created.produto.nome === productName &&
          created.produto.status === 'rascunho',
        'Nome ou situação do rascunho incorretos.',
      )

      const stored = await db.prepare(`
        SELECT nome, descricao, status
        FROM produtos
        WHERE id = ?
      `).bind(created.produto.id).first<{
        nome: string
        descricao: string
        status: string
      }>()

      check(
        stored?.nome === productName &&
          stored.descricao === input.descricao.trim() &&
          stored.status === 'rascunho',
        'Dados gravados incorretamente.',
      )

      results.push('Rascunho gravado com descrição maior que 2 KB.')

      const duplicateResponse = await send(input)
      await expectStatus(duplicateResponse, 201)

      const duplicate = await duplicateResponse.json() as {
        produto: { id: string; slug: string }
      }

      check(
        duplicate.produto.id !== created.produto.id &&
          duplicate.produto.slug !== created.produto.slug,
        'Conflito de nome não recebeu endereço distinto.',
      )
      results.push('Nomes iguais recebem identificadores e endereços distintos.')

      // Referência temporária à foto real já utilizada no projeto.
      await db.prepare(`
        INSERT INTO produto_imagens (
          id, produto_id, cloudinary_public_id,
          url, texto_alternativo, ordem
        ) VALUES (?, ?, ?, ?, ?, 0)
      `).bind(
        `imagem-teste-${suffix}`,
        created.produto.id,
        'essencia/terco-azul',
        'https://res.cloudinary.com/lbspaasm/image/upload/v1792939118/essencia/terco-azul.png',
        'Imagem real usada exclusivamente no teste local',
      ).run()

      const publicResponse = await publicProductsRoute({
        request: new Request(`${origin}/api/produtos`),
        env: { DB: db },
      } as Parameters<typeof publicProductsRoute>[0])

      check(publicResponse.status === 200, 'Consulta pública falhou.')

      const publicData = await publicResponse.json() as {
        produtos: Array<{ slug: string }>
      }

      check(
        !publicData.produtos.some(
          (product) => product.slug === created.produto.slug,
        ),
        'Rascunho apareceu na API pública.',
      )
      results.push('Rascunho com foto continua fora do catálogo público.')

      await db.prepare(`
        UPDATE administradores SET ativo = 0 WHERE id = ?
      `).bind(administratorId).run()

      await expectStatus(await send(input), 401)
      results.push('Administrador desativado não cadastra peças.')

      const total = await db.prepare(`
        SELECT COUNT(*) AS total FROM produtos WHERE nome = ?
      `).bind(productName).first<{ total: number }>()

      check(
        total?.total === 2,
        'Uma tentativa recusada deixou produto no banco.',
      )
      results.push('Tentativas recusadas não deixam produtos gravados.')

      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste de cadastro de rascunhos:', error)

      return Response.json(
        { passou: false, erro: 'Confira o terminal do teste.' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    } finally {
      await db.prepare(`
        DELETE FROM produto_imagens
        WHERE produto_id IN (
          SELECT id FROM produtos WHERE nome = ?
        )
      `).bind(productName).run()

      await db.prepare(`
        DELETE FROM produtos WHERE nome = ?
      `).bind(productName).run()

      await db.prepare(`
        DELETE FROM sessoes_administrativas
        WHERE administrador_id = ?
      `).bind(administratorId).run()

      await db.prepare(`
        DELETE FROM administradores WHERE id = ?
      `).bind(administratorId).run()
    }
  },
}