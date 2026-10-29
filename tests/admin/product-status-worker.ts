import { onRequest as statusRoute } from '../../functions/api/admin/produtos/[id]/status.ts'
import { createDraftProduct } from '../../server/admin/createDraftProduct.ts'
import { createSessionCookie } from '../../server/auth/sessionCookie.ts'
import {
  createSessionToken,
  hashSessionToken,
} from '../../server/auth/sessionToken.ts'

type Env = {
  DB: D1Database
}

type Review = {
  id: string
  nome: string
  slug: string
  descricao: string
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
    const administratorId = `admin-status-${suffix}`
    const imageId = `imagem-status-${suffix}`
    const cookie = createSessionCookie(token).split(';')[0]
    const results: string[] = []
    let productId: string | null = null

    async function send(
      id: string,
      method: 'GET' | 'POST',
      options: {
        action?: string
        version?: string
        authenticated?: boolean
        sourceOrigin?: string
        rawBody?: string
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
          headers.set(
            'If-Match',
            JSON.stringify(options.version),
          )
        }
      }

      const context: Parameters<typeof statusRoute>[0] = {
        request: new Request(
          `${origin}/api/admin/produtos/${id}/status`,
          {
            method,
            headers,
            body:
              method === 'POST'
                ? options.rawBody ??
                  JSON.stringify({
                    acao: options.action ?? 'publicar',
                  })
                : undefined,
          },
        ),
        env: {
          DB: db,
          ADMIN_ORIGIN: origin,
          ASSETS: {
            fetch: async () => {
              throw new Error(
                'Este teste não utiliza arquivos estáticos.',
              )
            },
          },
        },
        params: { id },
        data: {},
        functionPath: `/api/admin/produtos/${id}/status`,
        waitUntil: () => {},
        passThroughOnException: () => {},
        next: async () => {
          throw new Error(
            'Este teste não utiliza a próxima rota.',
          )
        },
      }

      return statusRoute(context)
    }

    async function expectStatus(
      response: Response,
      expected: number,
    ) {
      check(
        response.status === expected,
        `Esperado HTTP ${expected}; recebido ${response.status}.`,
      )
      check(
        response.headers.get('Cache-Control') === 'no-store',
        'Resposta sem proteção de cache.',
      )
    }

    async function load(id: string): Promise<Review> {
      const response = await send(id, 'GET')
      await expectStatus(response, 200)

      const payload = await response.json() as {
        produto: Review
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
        `status.${suffix}`,
        `${suffix}@example.invalid`,
        `firebase-status-${suffix}`,
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
        name: `TESTE situação ${suffix}`,
        collectionSlug: 'essencia',
        materialSlug: 'perolas',
        description: '',
      })

      check(created.ok, 'Falha ao preparar o rascunho.')
      productId = created.product.id

      await expectStatus(
        await send(productId, 'GET', {
          authenticated: false,
        }),
        401,
      )

      await expectStatus(
        await send(productId, 'POST', {
          authenticated: false,
        }),
        401,
      )

      await expectStatus(
        await send(productId, 'POST', {
          sourceOrigin: 'https://outra.example',
        }),
        403,
      )

      results.push(
        'Consulta e alteração sem sessão recusadas; outra origem recusada.',
      )

      let review = await load(productId)

      await expectStatus(
        await send(productId, 'POST'),
        428,
      )

      await expectStatus(
        await send(productId, 'POST', {
          version: review.atualizado_em,
          action: 'excluir',
        }),
        400,
      )

      await expectStatus(
        await send(productId, 'POST', {
          version: review.atualizado_em,
          rawBody: JSON.stringify({
            acao: 'publicar',
            status: 'publicado',
          }),
        }),
        400,
      )

      await expectStatus(
        await send(productId, 'POST', {
          version: review.atualizado_em,
          rawBody: 'x'.repeat(2049),
        }),
        413,
      )

      results.push(
        'Versão obrigatória; ação inválida, campos extras e conteúdo excessivo recusados.',
      )

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
        'Foto real utilizada como referência no teste isolado',
      ).run()

      await expectStatus(
        await send(productId, 'POST', {
          version: review.atualizado_em,
        }),
        409,
      )

      check(
        (await load(productId)).status === 'rascunho',
        'Peça sem descrição foi publicada.',
      )

      results.push(
        'Publicação sem descrição recusada mesmo com foto.',
      )

      await db.prepare(`
        UPDATE produtos
        SET descricao = 'Descrição exclusiva do teste isolado.'
        WHERE id = ?
      `).bind(productId).run()

      await db.prepare(`
        DELETE FROM produto_imagens WHERE id = ?
      `).bind(imageId).run()

      review = await load(productId)

      await expectStatus(
        await send(productId, 'POST', {
          version: review.atualizado_em,
        }),
        409,
      )

      results.push('Publicação sem foto recusada.')

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
        'Foto real utilizada como referência no teste isolado',
      ).run()

      await db.prepare(`
        UPDATE produtos
        SET material_id = (
          SELECT id FROM materiais WHERE slug = 'madeira'
        )
        WHERE id = ?
      `).bind(productId).run()

      review = await load(productId)

      await expectStatus(
        await send(productId, 'POST', {
          version: review.atualizado_em,
        }),
        409,
      )

      await db.prepare(`
        UPDATE produtos
        SET material_id = (
          SELECT id FROM materiais WHERE slug = 'perolas'
        )
        WHERE id = ?
      `).bind(productId).run()

      results.push(
        'Combinação incompatível de coleção e material recusada.',
      )

      review = await load(productId)
      const originalSlug = review.slug

      const concurrent = await Promise.all(
        Array.from({ length: 5 }, () =>
          send(productId!, 'POST', {
            action: 'publicar',
            version: review.atualizado_em,
          }),
        ),
      )

      check(
        concurrent.filter((response) => response.status === 200)
          .length === 1 &&
        concurrent.filter((response) => response.status === 409)
          .length === 4,
        'Publicações simultâneas não tiveram uma única vencedora.',
      )

      let updated = await load(productId)

      check(
        updated.status === 'publicado',
        'Peça completa não foi publicada.',
      )

      check(
        updated.atualizado_em !== review.atualizado_em,
        'A publicação não atualizou a versão.',
      )

      results.push(
        'Peça completa publicada; cinco confirmações simultâneas geram uma única alteração.',
      )

      await expectStatus(
        await send(productId, 'POST', {
          action: 'arquivar',
          version: review.atualizado_em,
        }),
        409,
      )

      check(
        (await load(productId)).status === 'publicado',
        'Versão antiga alterou a peça.',
      )

      results.push(
        'Versão antiga recusada sem sobrescrever a situação atual.',
      )

      await expectStatus(
        await send(productId, 'POST', {
          action: 'arquivar',
          version: updated.atualizado_em,
        }),
        200,
      )

      updated = await load(productId)
      check(updated.status === 'arquivado', 'Falha ao arquivar.')

      await expectStatus(
        await send(productId, 'POST', {
          action: 'publicar',
          version: updated.atualizado_em,
        }),
        409,
      )

      await expectStatus(
        await send(productId, 'POST', {
          action: 'voltar-rascunho',
          version: updated.atualizado_em,
        }),
        200,
      )

      updated = await load(productId)
      check(updated.status === 'rascunho', 'Falha ao restaurar.')

      const image = await db.prepare(`
        SELECT id FROM produto_imagens
        WHERE id = ? AND produto_id = ?
      `).bind(imageId, productId).first<{ id: string }>()

      check(
        updated.slug === originalSlug &&
        updated.descricao === 'Descrição exclusiva do teste isolado.' &&
        image?.id === imageId,
        'Uma transição modificou endereço, descrição ou foto.',
      )

      results.push(
        'Arquivamento e retorno a rascunho preservam endereço, descrição e foto.',
      )

      await db.prepare(`
        UPDATE administradores SET ativo = 0 WHERE id = ?
      `).bind(administratorId).run()

      await expectStatus(
        await send(productId, 'POST', {
          version: updated.atualizado_em,
        }),
        401,
      )

      const unchanged = await db.prepare(`
        SELECT status FROM produtos WHERE id = ?
      `).bind(productId).first<{ status: string }>()

      check(
        unchanged?.status === 'rascunho',
        'Administrador desativado alterou a peça.',
      )

      results.push(
        'Administrador desativado não altera a situação da peça.',
      )

      return Response.json({
        passou: true,
        resultados: results,
      })
    } catch (error) {
      console.error('Falha no teste de publicação:', error)

      return Response.json(
        { passou: false, erro: 'Confira o terminal do teste.' },
        { status: 500 },
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