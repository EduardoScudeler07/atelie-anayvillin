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
  'produto-graca-cristal-rosa-claro',
  'colecao-graca',
  'material-cristais',
  'Terço Cristal Rosa Claro',
  'terco-cristal-rosa-claro',
  'A suavidade do rosa-claro encontra o brilho dos cristais em uma peça que convida à oração com carinho e delicadeza. Parte da coleção Graça, este terço é feito sob encomenda para acompanhar sua história de fé ou presentear alguém especial.',
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
  'imagem-graca-cristal-rosa-claro-01',
  'produto-graca-cristal-rosa-claro',
  'graca/terco-rosa-claro',
  'https://res.cloudinary.com/lbspaasm/image/upload/v1793062010/graca/terco-rosa-claro.png',
  'Terço de cristais rosa-claro da coleção Graça',
  0
);