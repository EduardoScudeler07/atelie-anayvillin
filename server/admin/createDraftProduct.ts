import type { DraftProductInput } from './productInput.ts'

type CreatedDraft = {
  id: string
  nome: string
  slug: string
  status: 'rascunho'
}

type CreateDraftResult =
  | { ok: true; product: CreatedDraft }
  | { ok: false; reason: 'unavailable-options' }

function createSlugBase(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/g, '') || 'peca'
}

export async function createDraftProduct(
  db: D1Database,
  input: DraftProductInput,
): Promise<CreateDraftResult> {
  const uuid = crypto.randomUUID()
  const id = `produto-${uuid}`
  const base = createSlugBase(input.name)

  for (let attempt = 0; attempt < 2; attempt++) {
    const slug = attempt === 0
      ? base
      : `${base}-${uuid.replace(/-/g, '').slice(0, 12)}`

    try {
      const product = await db.prepare(`
        INSERT INTO produtos (
          id,
          colecao_id,
          material_id,
          nome,
          slug,
          descricao,
          status
        )
        SELECT
          ?,
          c.id,
          m.id,
          ?,
          ?,
          ?,
          'rascunho'
        FROM colecoes c
        CROSS JOIN materiais m
        WHERE c.slug = ?
          AND m.slug = ?
          AND c.ativo = 1
          AND m.ativo = 1
        RETURNING id, nome, slug, status
      `).bind(
        id,
        input.name,
        slug,
        input.description,
        input.collectionSlug,
        input.materialSlug,
      ).first<CreatedDraft>()

      if (!product) {
        return {
          ok: false,
          reason: 'unavailable-options',
        }
      }

      return {
        ok: true,
        product,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : ''

      const slugConflict = message.includes(
        'UNIQUE constraint failed: produtos.slug',
      )

      if (attempt === 0 && slugConflict) {
        continue
      }

      throw error
    }
  }

  throw new Error('Não foi possível gerar o endereço da peça.')
}