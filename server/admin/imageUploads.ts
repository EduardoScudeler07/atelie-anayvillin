import type { UploadedImage } from '../media/cloudinaryUpload.ts'

export type ImageUploadJob = {
  id: string
  productId: string
  administratorId: string
  publicId: string
  alt: string
}

export type StoredProductImage = {
  id: string
  url: string
  texto_alternativo: string
  ordem: number
}

type UploadFailureCode =
  | 'configuration'
  | 'rejected'
  | 'unavailable'
  | 'unexpected-response'
  | 'session-expired'
  | 'product-changed'
  | 'database'

export async function createImageUpload(
  db: D1Database,
  input: {
    productId: string
    administratorId: string
    folder: string
    alt: string
  },
): Promise<ImageUploadJob | null> {
  const uuid = crypto.randomUUID()
  const id = `imagem-${uuid}`
  const publicId = `${input.folder}/${input.productId}/${uuid}`

  return db.prepare(`
    INSERT INTO envios_imagens (
      id,
      produto_id,
      administrador_id,
      cloudinary_public_id,
      texto_alternativo
    )
    SELECT ?, p.id, a.id, ?, ?
    FROM produtos p
    CROSS JOIN administradores a
    WHERE p.id = ?
      AND p.status = 'rascunho'
      AND a.id = ?
      AND a.ativo = 1
    RETURNING
      id,
      produto_id AS productId,
      administrador_id AS administratorId,
      cloudinary_public_id AS publicId,
      texto_alternativo AS alt
  `).bind(
    id,
    publicId,
    input.alt,
    input.productId,
    input.administratorId,
  ).first<ImageUploadJob>()
}

export async function completeImageUpload(
  db: D1Database,
  job: ImageUploadJob,
  uploaded: UploadedImage,
): Promise<StoredProductImage | null> {
  if (uploaded.publicId !== job.publicId) {
    throw new Error('Identificador do upload inconsistente.')
  }

  const results = await db.batch<StoredProductImage>([
    db.prepare(`
      INSERT INTO produto_imagens (
        id,
        produto_id,
        cloudinary_public_id,
        url,
        texto_alternativo,
        ordem
      )
      SELECT
        e.id,
        e.produto_id,
        e.cloudinary_public_id,
        ?,
        e.texto_alternativo,
        COALESCE(
          (
            SELECT MAX(i.ordem) + 1
            FROM produto_imagens i
            WHERE i.produto_id = e.produto_id
          ),
          0
        )
      FROM envios_imagens e
      JOIN produtos p ON p.id = e.produto_id
      JOIN administradores a ON a.id = e.administrador_id
      WHERE e.id = ?
        AND e.produto_id = ?
        AND e.administrador_id = ?
        AND e.cloudinary_public_id = ?
        AND e.status = 'pendente'
        AND p.status = 'rascunho'
        AND a.ativo = 1
      RETURNING id, url, texto_alternativo, ordem
    `).bind(
      uploaded.url,
      job.id,
      job.productId,
      job.administratorId,
      job.publicId,
    ),

    db.prepare(`
      UPDATE produtos
      SET atualizado_em = strftime(
        '%Y-%m-%dT%H:%M:%fZ',
        MAX(
          atualizado_em,
          strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        ),
        '+0.001 seconds'
      )
      WHERE id = ?
        AND status = 'rascunho'
        AND EXISTS (
          SELECT 1
          FROM envios_imagens e
          JOIN produto_imagens i ON i.id = e.id
          WHERE e.id = ?
            AND e.produto_id = produtos.id
            AND e.status = 'pendente'
            AND i.produto_id = produtos.id
        )
    `).bind(job.productId, job.id),

    db.prepare(`
      UPDATE envios_imagens
      SET
        status = 'concluido',
        atualizado_em = MAX(criado_em, unixepoch())
      WHERE id = ?
        AND produto_id = ?
        AND administrador_id = ?
        AND status = 'pendente'
        AND EXISTS (
          SELECT 1
          FROM produto_imagens i
          WHERE i.id = envios_imagens.id
            AND i.produto_id = envios_imagens.produto_id
            AND i.cloudinary_public_id =
              envios_imagens.cloudinary_public_id
        )
    `).bind(
      job.id,
      job.productId,
      job.administratorId,
    ),
  ])

  return results[0].results[0] ?? null
}

export async function failImageUpload(
  db: D1Database,
  job: ImageUploadJob,
  code: UploadFailureCode,
): Promise<void> {
  await db.prepare(`
    UPDATE envios_imagens
    SET
      status = 'falhou',
      erro_codigo = ?,
      atualizado_em = MAX(criado_em, unixepoch())
    WHERE id = ?
      AND produto_id = ?
      AND administrador_id = ?
      AND status = 'pendente'
  `).bind(
    code,
    job.id,
    job.productId,
    job.administratorId,
  ).run()
}