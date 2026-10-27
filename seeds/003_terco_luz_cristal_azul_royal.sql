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
  'produto-luz-cristal-azul-royal',
  'colecao-luz',
  'material-cristais',
  'Terço Cristal Azul Royal',
  'terco-cristal-azul-royal',
  'Com o brilho dos cristais e a intensidade do azul royal, este terço convida a viver a fé com presença e significado. Parte da coleção Luz, é feito sob encomenda para acompanhar seus momentos de oração ou presentear alguém especial.',
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
  'imagem-luz-cristal-azul-royal-01',
  'produto-luz-cristal-azul-royal',
  'luz/terco-azul-royal',
  'https://res.cloudinary.com/lbspaasm/image/upload/v1793017382/luz/terco-azul-royal.png',
  'Terço de cristais azul royal da coleção Luz',
  0
);