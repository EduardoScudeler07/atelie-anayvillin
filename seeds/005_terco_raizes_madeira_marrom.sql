INSERT INTO produtos (
  id,
  colecao_id,
  material_id,
  nome,
  slug,
  descricao,
  status
)
VALUES (
  'produto-raizes-madeira-marrom',
  'colecao-raizes',
  'material-madeira',
  'Terço Madeira Marrom',
  'terco-madeira-marrom',
  'A simplicidade da madeira em uma peça que convida a cultivar a fé e encontrar serenidade na oração. Parte da coleção Raízes, este terço é feito sob encomenda para acompanhar sua caminhada ou presentear alguém especial.',
  'rascunho'
);

INSERT INTO produto_imagens (
  id,
  produto_id,
  cloudinary_public_id,
  url,
  texto_alternativo,
  ordem
)
VALUES (
  'imagem-raizes-madeira-marrom-01',
  'produto-raizes-madeira-marrom',
  'raizes/terco-marrom',
  'https://res.cloudinary.com/lbspaasm/image/upload/v1793062341/raizes/terco-marrom.png',
  'Terço de madeira marrom da coleção Raízes',
  0
);
