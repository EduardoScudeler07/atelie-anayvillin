INSERT INTO colecoes (
  id, nome, slug, descricao, ordem, ativo
)
VALUES
  (
    'colecao-essencia',
    'Essência',
    'essencia',
    'A expressão da simplicidade e da delicadeza. Com pérolas, é uma coleção clássica e atemporal.',
    1,
    1
  ),
  (
    'colecao-promessa',
    'Promessa',
    'promessa',
    'Une a beleza das pérolas ao significado da personalização, com fé e significado em cada detalhe.',
    2,
    1
  ),
  (
    'colecao-luz',
    'Luz',
    'luz',
    'Encanta pelo brilho e pela sofisticação. Uma coleção para quem procura um terço marcante.',
    3,
    1
  ),
  (
    'colecao-graca',
    'Graça',
    'graca',
    'Reúne a elegância dos cristais e a exclusividade da personalização, pensada para representar sua história.',
    4,
    1
  ),
  (
    'colecao-raizes',
    'Raízes',
    'raizes',
    'A beleza da simplicidade, inspirada na fé, na oração e nas raízes que carregamos no coração.',
    5,
    1
  ),
  (
    'colecao-infantil',
    'Infantil',
    'infantil',
    '',
    6,
    0
  );

INSERT INTO materiais (
  id, nome, slug, ativo
)
VALUES
  ('material-perolas', 'Pérolas', 'perolas', 1),
  ('material-cristais', 'Cristais', 'cristais', 1),
  ('material-madeira', 'Madeira', 'madeira', 1);