INSERT INTO colecoes (id, nome, slug)
VALUES ('teste-colecao', 'Coleção de teste', 'colecao-de-teste');

INSERT INTO materiais (id, nome, slug)
VALUES ('teste-material', 'Material de teste', 'material-de-teste');

INSERT INTO produtos (
  id,
  colecao_id,
  material_id,
  nome,
  slug
)
VALUES (
  'teste-produto',
  'teste-colecao',
  'teste-material',
  'Produto de teste',
  'produto-de-teste'
);

SELECT nome, status, descricao, criado_em
FROM produtos
WHERE id = 'teste-produto';