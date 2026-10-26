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
  'produto-promessa-perola-branca',
  'colecao-promessa',
  'material-perolas',
  'Terço Pérola Branca',
  'terco-perola-branca',
  'Com a delicadeza das pérolas brancas, este terço é um convite a cultivar a fé nos pequenos momentos do dia. Parte da coleção Promessa, é feito sob encomenda para acompanhar suas orações ou presentear alguém especial.',
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
  'imagem-promessa-perola-branca-01',
  'produto-promessa-perola-branca',
  'promessa/terco-branco',
  'https://res.cloudinary.com/lbspaasm/image/upload/v1793016020/promessa/terco-branco.png',
  'Terço de pérolas brancas da coleção Promessa',
  0
);

