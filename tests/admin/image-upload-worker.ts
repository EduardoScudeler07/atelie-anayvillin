import { onRequest as imageRoute } from '../../functions/api/admin/produtos/[id]/imagens.ts'
import { createDraftProduct } from '../../server/admin/createDraftProduct.ts'
import { MAX_IMAGE_BYTES } from '../../server/admin/imageInput.ts'
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
    const originalFetch = globalThis.fetch
    const origin = 'https://admin.example'
    const token = createSessionToken()
    const hash = await hashSessionToken(token)
    const suffix = hash.slice(0, 16)
    const administratorId = `admin-image-${suffix}`
    const originalImageId = `imagem-original-${suffix}`
    const cookie = createSessionCookie(token).split(';')[0]
    const folder = 'atelie-anayvillin-preview/produtos'
    const results: string[] = []

    let productId: string | null = null
    let providerCalls = 0
    let mode: 'ok' | 'reject' | 'invalid' | 'deactivate' = 'ok'

    const routeEnv = {
      DB: db,
      ADMIN_ORIGIN: origin,
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: '123456789012345',
      CLOUDINARY_API_SECRET: 'segredo-exclusivamente-ficticio',
      CLOUDINARY_UPLOAD_PRESET: 'preset_teste',
      CLOUDINARY_UPLOAD_FOLDER: folder,
      ASSETS: {
        fetch: async () => {
          throw new Error('O teste não utiliza arquivos estáticos.')
        },
      },
    }

    function photoForm(
      bytes: Uint8Array = new Uint8Array([
        137, 80, 78, 71, 13, 10, 26, 10,
      ]),
      mime = 'image/png',
    ): FormData {
      // Cabeçalho fictício: usado apenas com o provedor simulado.
      const form = new FormData()
      form.set(
        'foto',
        new File([bytes], 'foto-teste.png', { type: mime }),
      )
      form.set('texto_alternativo', 'Descrição fictícia da foto de teste.')
      return form
    }

    async function send(
      method: 'GET' | 'POST',
      options: {
        body?: FormData
        authenticated?: boolean
        source?: string
      } = {},
    ): Promise<Response> {
      check(productId !== null, 'Peça de teste ausente.')

      const headers = new Headers()

      if (options.authenticated !== false) {
        headers.set('Cookie', cookie)
      }

      if (method === 'POST') {
        headers.set('Origin', options.source ?? origin)
        headers.set('X-Atelie-Admin', '1')
      }

      const context: Parameters<typeof imageRoute>[0] = {
        request: new Request(
          `${origin}/api/admin/produtos/${productId}/imagens`,
          {
            method,
            headers,
            body: method === 'POST'
              ? options.body ?? photoForm()
              : undefined,
          },
        ),
        env: routeEnv,
        params: { id: productId },
        data: {},
        functionPath: `/api/admin/produtos/${productId}/imagens`,
        waitUntil: () => {},
        passThroughOnException: () => {},
        next: async () => {
          throw new Error('O teste não utiliza a próxima rota.')
        },
      }

      return imageRoute(context)
    }

    function expectStatus(response: Response, expected: number) {
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
      // Bloqueia chamadas externas e simula somente o endpoint esperado.
      globalThis.fetch = async (address, options) => {
        check(
          String(address) ===
            'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
          'O teste bloqueou um destino de rede inesperado.',
        )

        providerCalls++

        check(
          options?.method === 'POST' &&
            options.redirect === 'manual' &&
            options.body instanceof FormData,
          'Requisição de upload inesperada.',
        )

        const form = options.body
        const file = form.get('file')
        const publicId = form.get('public_id')

        check(file instanceof File, 'Arquivo não encaminhado.')
        check(
          typeof publicId === 'string' &&
            publicId.startsWith(`${folder}/`),
          'Destino do upload incorreto.',
        )
        check(
          form.get('overwrite') === 'false' &&
            form.get('allowed_formats') === 'jpg,png,webp' &&
            /^[0-9a-f]{64}$/.test(String(form.get('signature'))) &&
            !form.has('api_secret'),
          'Proteções do upload incorretas.',
        )

        if (mode === 'reject') {
          return Response.json(
            { error: { message: 'Arquivo recusado no teste.' } },
            { status: 400 },
          )
        }

        if (mode === 'deactivate') {
          await db.prepare(`
            UPDATE administradores SET ativo = 0 WHERE id = ?
          `).bind(administratorId).run()
        }

        const version = 1790000000

        return Response.json({
          public_id: publicId,
          resource_type: 'image',
          type: 'upload',
          format: 'png',
          bytes: file.size,
          width: 1200,
          height: 1200,
          version,
          secure_url: mode === 'invalid'
            ? 'https://outro.example/foto.png'
            : `https://res.cloudinary.com/test-cloud/image/upload/v${version}/${publicId}.png`,
        })
      }

      const now = Math.floor(Date.now() / 1000)

      await db.prepare(`
        INSERT INTO administradores (
          id, nome, usuario, email_firebase, firebase_uid, ativo
        ) VALUES (?, ?, ?, ?, ?, 1)
      `).bind(
        administratorId,
        'Administrador fictício',
        `imagem.${suffix}`,
        `${suffix}@example.invalid`,
        `firebase-image-${suffix}`,
      ).run()

      await db.prepare(`
        INSERT INTO sessoes_administrativas (
          token_hash, administrador_id,
          criado_em, ultima_atividade_em, expira_em
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        hash,
        administratorId,
        now,
        now,
        now + 86400,
      ).run()

      const created = await createDraftProduct(db, {
        name: `TESTE Fotos ${suffix}`,
        collectionSlug: 'essencia',
        materialSlug: 'perolas',
        description: 'Descrição fictícia para o teste isolado.',
      })

      check(created.ok, 'Não foi possível preparar o rascunho.')
      productId = created.product.id

      await db.prepare(`
        INSERT INTO produto_imagens (
          id, produto_id, cloudinary_public_id,
          url, texto_alternativo, ordem
        ) VALUES (?, ?, ?, ?, ?, 0)
      `).bind(
        originalImageId,
        productId,
        'essencia/terco-azul',
        'https://res.cloudinary.com/lbspaasm/image/upload/v1792939118/essencia/terco-azul.png',
        'Referência à foto real já existente',
      ).run()

      expectStatus(
        await send('GET', { authenticated: false }),
        401,
      )
      expectStatus(
        await send('POST', { authenticated: false }),
        401,
      )
      results.push('Consulta e envio sem sessão recusados.')

      expectStatus(
        await send('POST', { source: 'https://outro.example' }),
        403,
      )
      results.push('Envio de outra origem recusado.')

      expectStatus(
        await send('POST', {
          body: photoForm(new TextEncoder().encode('<svg></svg>')),
        }),
        415,
      )
      results.push('Arquivo disfarçado de PNG recusado.')

      const oversized = new Uint8Array(MAX_IMAGE_BYTES + 1)
      oversized.set([137, 80, 78, 71, 13, 10, 26, 10])

      expectStatus(
        await send('POST', { body: photoForm(oversized) }),
        413,
      )
      results.push('Arquivo acima de 5 MiB recusado.')

      const extraFields = photoForm()
      extraFields.set('status', 'publicado')

      expectStatus(
        await send('POST', { body: extraFields }),
        400,
      )
      check(providerCalls === 0, 'Arquivo recusado chegou ao provedor.')
      results.push('Campos extras recusados antes de consultar o provedor.')

      expectStatus(await send('POST'), 201)

      const firstList = await send('GET')
      expectStatus(firstList, 200)

      const firstData = await firstList.json() as {
        imagens: Array<{ id: string; ordem: number }>
      }

      check(
        firstData.imagens.length === 2 &&
          firstData.imagens[0].id === originalImageId &&
          firstData.imagens[0].ordem === 0 &&
          firstData.imagens[1].ordem === 1,
        'Associação ou preservação da capa incorreta.',
      )
      results.push('Foto associada sem substituir a capa existente.')

      mode = 'reject'
      expectStatus(await send('POST'), 422)
      results.push('Recusa do provedor tratada sem associar a foto.')

      mode = 'invalid'
      expectStatus(await send('POST'), 503)
      results.push('Resposta inconsistente do provedor recusada.')

      mode = 'deactivate'
      expectStatus(await send('POST'), 401)

      await db.prepare(`
        UPDATE administradores SET ativo = 1 WHERE id = ?
      `).bind(administratorId).run()

      results.push('Desativação durante o upload impede a associação.')

      mode = 'ok'

      const concurrent = await Promise.all([
        send('POST'),
        send('POST'),
      ])

      concurrent.forEach((response) => expectStatus(response, 201))

      const finalList = await send('GET')
      const finalData = await finalList.json() as {
        imagens: Array<{ id: string; ordem: number }>
      }

      check(
        finalData.imagens.length === 4 &&
          finalData.imagens.every(
            (image, index) => image.ordem === index,
          ) &&
          finalData.imagens[0].id === originalImageId,
        'Envios simultâneos deixaram a galeria inconsistente.',
      )
      results.push('Envios simultâneos recebem posições distintas.')

      const jobs = await db.prepare(`
        SELECT status, COUNT(*) AS total
        FROM envios_imagens
        WHERE produto_id = ?
        GROUP BY status
      `).bind(productId).all<{ status: string; total: number }>()

      check(
        jobs.results.find((row) => row.status === 'concluido')?.total === 3 &&
          jobs.results.find((row) => row.status === 'falhou')?.total === 3 &&
          !jobs.results.some((row) => row.status === 'pendente'),
        'Registros de conclusão e falha inconsistentes.',
      )
      results.push('Conclusões e falhas registradas sem pendências neste teste.')

      await db.prepare(`
        UPDATE produtos SET status = 'publicado' WHERE id = ?
      `).bind(productId).run()

      const callsBefore = providerCalls
      expectStatus(await send('POST'), 409)

      check(
        providerCalls === callsBefore,
        'Peça publicada iniciou um novo upload.',
      )
      results.push('Peça publicada não recebe novos uploads por esta rota.')

      return Response.json(
        { passou: true, resultados: results },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      console.error('Falha no teste isolado de fotos:', error)

      return Response.json(
        { passou: false, erro: 'Confira o terminal do teste.' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    } finally {
      globalThis.fetch = originalFetch

      if (productId) {
        await db.prepare(`
          DELETE FROM envios_imagens WHERE produto_id = ?
        `).bind(productId).run()

        await db.prepare(`
          DELETE FROM produto_imagens WHERE produto_id = ?
        `).bind(productId).run()

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