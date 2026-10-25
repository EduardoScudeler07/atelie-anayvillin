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
  'produto-essencia-perola-azul',
  'colecao-essencia',
  'material-perolas',
  'Terço Pérola Azul',
  'terco-perola-azul',
  'Delicado em cada detalhe, o Terço Pérola Azul é um convite a reservar um momento para a fé e a oração. Confeccionado com pérolas azuis, faz parte da coleção Essência e é feito sob encomenda.',
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
  'imagem-essencia-perola-azul-01',
  'produto-essencia-perola-azul',
  'essencia/terco-azul',
  'https://res.cloudinary.com/lbspaasm/image/upload/v1792939118/essencia/terco-azul.png',
  'Terço de pérolas azuis da coleção Essência',
  0
);