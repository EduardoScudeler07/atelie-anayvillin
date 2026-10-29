import type { DraftProductInput } from './productInput.ts'

type UpdatedDraft = {
  id: string
  nome: string
  slug: string
  status: 'rascunho'
  atualizado_em: string
}

export async function updateDraftProduct(
  db: D1Database,
  id: string,
  expectedUpdatedAt: string,
  input: DraftProductInput,
): Promise<UpdatedDraft | null> {
  return db.prepare(`
    UPDATE produtos
    SET
      nome = ?,
      descricao = ?,
      colecao_id = (
        SELECT id FROM colecoes
        WHERE slug = ? AND ativo = 1
      ),
      material_id = (
        SELECT id FROM materiais
        WHERE slug = ? AND ativo = 1
      ),
      atualizado_em = strftime(
        '%Y-%m-%dT%H:%M:%fZ',
        MAX(
          atualizado_em,
          strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        ),
        '+0.001 seconds'
      )
    WHERE id = ?
      AND status = 'rascunho'
      AND atualizado_em = ?
      AND EXISTS (
        SELECT 1 FROM colecoes
        WHERE slug = ? AND ativo = 1
      )
      AND EXISTS (
        SELECT 1 FROM materiais
        WHERE slug = ? AND ativo = 1
      )
    RETURNING id, nome, slug, status, atualizado_em
  `).bind(
    input.name,
    input.description,
    input.collectionSlug,
    input.materialSlug,
    id,
    expectedUpdatedAt,
    input.collectionSlug,
    input.materialSlug,
  ).first<UpdatedDraft>()
}