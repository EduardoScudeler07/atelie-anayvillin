import { onRequest as productRoute } from '../../functions/api/admin/produtos/[id].ts'
import { createDraftProduct } from '../../server/admin/createDraftProduct.ts'
import { createSessionCookie } from '../../server/auth/sessionCookie.ts'
import {
  createSessionToken,
  hashSessionToken,
} from '../../server/auth/sessionToken.ts'

type Env = {
  DB: D1Database
}

type ProductDetails = {
  id: string
  nome: string
  slug: string
  descricao: string
  colecao_slug: string
  material_slug: string
  status: string
  atualizado_em: string
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
    const administratorId = `admin-edit-${suffix}`
    const cookie = createSessionCookie(token).split(';')[0]
    const imageId = `imagem-edit-${suffix}`
    const results: string[] = []
    let productId: string | null = null

    const fields = {
      nome: `TESTE editado '${suffix}`,
      colecao_slug: 'promessa',
      material_slug: 'perolas',
      descricao: 'Descrição de teste atualizada.',
    }

        async function send(
      id: string,
      method: 'GET' | 'POST',
      options: {
        body?: Record<string, unknown>
        version?: string
        authenticated?: boolean
        sourceOrigin?: string
      } = {},
    ): Promise<Response> {
      const headers = new Headers()

      if (options.authenticated !== false) {
        headers.set('Cookie', cookie)
      }

      if (method === 'POST') {
        headers.set('Origin', options.sourceOrigin ?? origin)
        headers.set('Content-Type', 'application/json')
        headers.set('X-Atelie-Admin', '1')

        if (options.version) {
          headers.set('If-Match', JSON.stringify(options.version))
        }
      }

      const context: Parameters<typeof productRoute>[0] = {
        request: new Request(
          `${origin}/api/admin/produtos/${id}`,
          {
            method,
            headers,
            body: method === 'POST'
              ? JSON.stringify(options.body ?? fields)
              : undefined,
          },
        ),
                env: {
          DB: db,
          ADMIN_ORIGIN: origin,
          ASSETS: {
            fetch: async () => {
              throw new Error('Este teste não utiliza arquivos estáticos.')
            },
          },
        },
        params: { id },
        data: {},
        functionPath: `/api/admin/produtos/${id}`,
        waitUntil: () => {},
        passThroughOnException: () => {},
        next: async () => {
          throw new Error('Este teste não utiliza a próxima rota.')
        },
      }

      return productRoute(context)
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

    async function load(id: string): Promise<ProductDetails> {
      const response = await send(id, 'GET')
      await expectStatus(response, 200)

      const payload = await response.json() as {
        produto: ProductDetails
      }

      return payload.produto
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
        `edicao.${suffix}`,
        `${suffix}@example.invalid`,
        `firebase-edit-${suffix}`,
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

      const created = await createDraftProduct(db, {
        name: `TESTE original ${suffix}`,
        collectionSlug: 'essencia',
        materialSlug: 'perolas',
        description: 'Descrição original de teste.',
      })

      check(created.ok, 'Não foi possível preparar o rascunho.')
      productId = created.product.id

      await db.prepare(`
        INSERT INTO produto_imagens (
          id, produto_id, cloudinary_public_id,
          url, texto_alternativo, ordem
        ) VALUES (?, ?, ?, ?, ?, 0)
      `).bind(
        imageId,
        productId,
        'essencia/terco-azul',
        'https://res.cloudinary.com/lbspaasm/image/upload/v1792939118/essencia/terco-azul.png',
        'Referência de foto real para teste isolado',
      ).run()

      await expectStatus(
        await send(productId, 'GET', { authenticated: false }),
        401,
      )
      await expectStatus(
        await send(productId, 'POST', { authenticated: false }),
        401,
      )
      results.push('Consulta e edição sem sessão recusadas.')

      await expectStatus(
        await send(productId, 'POST', {
          sourceOrigin: 'https://outro.example',
        }),
        403,
      )
      results.push('Edição de outra origem recusada.')

      const original = await load(productId)

      check(
        original.nome === created.product.nome &&
          original.colecao_slug === 'essencia' &&
          original.material_slug === 'perolas',
        'Carregamento do rascunho incorreto.',
      )
      results.push('Dados atuais do rascunho carregados.')

      await expectStatus(
        await send(productId, 'POST'),
        428,
      )
      results.push('Salvamento sem versão recusado.')

      const savedResponse = await send(productId, 'POST', {
        version: original.atualizado_em,
      })
      await expectStatus(savedResponse, 200)

      const updated = await load(productId)

      check(
        updated.nome === fields.nome &&
          updated.descricao === fields.descricao &&
          updated.colecao_slug === fields.colecao_slug &&
          updated.material_slug === fields.material_slug,
        'Campos não foram atualizados corretamente.',
      )
      check(
        updated.id === original.id &&
          updated.slug === original.slug &&
          updated.status === 'rascunho' &&
          updated.atualizado_em > original.atualizado_em,
        'Identificador, endereço, situação ou versão incorretos.',
      )

      const image = await db.prepare(`
        SELECT produto_id, cloudinary_public_id, ordem
        FROM produto_imagens WHERE id = ?
      `).bind(imageId).first<{
        produto_id: string
        cloudinary_public_id: string
        ordem: number
      }>()

      check(
        image?.produto_id === productId &&
          image.cloudinary_public_id === 'essencia/terco-azul' &&
          image.ordem === 0,
        'A edição alterou a referência da foto.',
      )

      results.push('Campos atualizados preservando endereço, situação e foto.')

      await expectStatus(
        await send(productId, 'POST', {
          version: original.atualizado_em,
          body: { ...fields, descricao: 'Não deve sobrescrever.' },
        }),
        409,
      )

      check(
        (await load(productId)).descricao === fields.descricao,
        'Versão antiga sobrescreveu os dados.',
      )
      results.push('Versão antiga recusada sem sobrescrever alterações.')

      await expectStatus(
        await send(productId, 'POST', {
          version: updated.atualizado_em,
          body: { ...fields, status: 'publicado' },
        }),
        400,
      )
      await expectStatus(
        await send(productId, 'POST', {
          version: updated.atualizado_em,
          body: { ...fields, material_slug: 'madeira' },
        }),
        400,
      )
      results.push('Mudança de status e combinação inválida recusadas.')

      const concurrent = await Promise.all(
        Array.from(
          { length: 5 },
          () => send(productId!, 'POST', {
            version: updated.atualizado_em,
            body: { ...fields, descricao: 'Edição concorrente de teste.' },
          }),
        ),
      )

      check(
        concurrent.filter((response) => response.status === 200).length === 1 &&
          concurrent.filter((response) => response.status === 409).length === 4,
        'Edições simultâneas não tiveram exatamente uma vencedora.',
      )
      results.push('Cinco edições simultâneas: uma salva e quatro recusadas.')

      for (const status of ['publicado', 'arquivado']) {
        await db.prepare(`
          UPDATE produtos SET status = ? WHERE id = ?
        `).bind(status, productId).run()

        await expectStatus(await send(productId, 'GET'), 409)
        await expectStatus(
          await send(productId, 'POST', {
            version: updated.atualizado_em,
          }),
          409,
        )
      }
      results.push('Esta edição não modifica publicados ou arquivados.')

      await expectStatus(
        await send(`produto-ausente-${suffix}`, 'GET'),
        404,
      )
      results.push('Peça inexistente retorna 404.')

      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste isolado de edição:', error)

      return Response.json(
        { passou: false, erro: 'Confira o terminal do teste.' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    } finally {
      await db.prepare(`
        DELETE FROM produto_imagens WHERE id = ?
      `).bind(imageId).run()

      if (productId) {
        await db.prepare(`
          DELETE FROM produtos WHERE id = ?
        `).bind(productId).run()
      }

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