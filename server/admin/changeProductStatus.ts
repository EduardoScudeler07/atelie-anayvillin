export type ProductStatus =
  | 'rascunho'
  | 'publicado'
  | 'arquivado'

export type ProductStatusAction =
  | 'publicar'
  | 'arquivar'
  | 'voltar-rascunho'

type ChangedProduct = {
  id: string
  nome: string
  slug: string
  status: ProductStatus
  atualizado_em: string
}

const transitions: Record<
  ProductStatusAction,
  { from: ProductStatus[]; to: ProductStatus }
> = {
  publicar: {
    from: ['rascunho'],
    to: 'publicado',
  },
  arquivar: {
    from: ['rascunho', 'publicado'],
    to: 'arquivado',
  },
  'voltar-rascunho': {
    from: ['publicado', 'arquivado'],
    to: 'rascunho',
  },
}

export async function changeProductStatus(
  db: D1Database,
  input: {
    productId: string
    administratorId: string
    expectedUpdatedAt: string
    action: ProductStatusAction
  },
): Promise<ChangedProduct | null> {
  const transition = transitions[input.action]

  if (!transition) return null

  const placeholders = transition.from.map(() => '?').join(', ')

  return db.prepare(`
    UPDATE produtos
    SET
      status = ?,
      atualizado_em = strftime(
        '%Y-%m-%dT%H:%M:%fZ',
        MAX(
          atualizado_em,
          strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        ),
        '+0.001 seconds'
      )
    WHERE id = ?
      AND atualizado_em = ?
      AND status IN (${placeholders})
      AND EXISTS (
        SELECT 1
        FROM administradores
        WHERE id = ? AND ativo = 1
      )
      AND (
        ? <> 'publicado'
        OR (
          length(trim(nome)) BETWEEN 3 AND 120
          AND length(trim(descricao)) BETWEEN 1 AND 3000
          AND EXISTS (
            SELECT 1
            FROM produto_imagens
            WHERE produto_id = produtos.id
              AND length(trim(url)) > 0
              AND length(trim(texto_alternativo)) > 0
          )
          AND EXISTS (
            SELECT 1
            FROM colecoes c
            JOIN materiais m ON m.id = produtos.material_id
            WHERE c.id = produtos.colecao_id
              AND c.ativo = 1
              AND m.ativo = 1
              AND (
                (c.slug IN ('essencia', 'promessa')
                  AND m.slug = 'perolas')
                OR
                (c.slug IN ('luz', 'graca')
                  AND m.slug = 'cristais')
                OR
                (c.slug = 'raizes'
                  AND m.slug = 'madeira')
              )
          )
        )
      )
    RETURNING id, nome, slug, status, atualizado_em
  `).bind(
    transition.to,
    input.productId,
    input.expectedUpdatedAt,
    ...transition.from,
    input.administratorId,
    transition.to,
  ).first<ChangedProduct>()
}