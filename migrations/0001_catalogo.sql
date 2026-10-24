CREATE TABLE colecoes (
  id TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  slug TEXT NOT NULL UNIQUE CHECK (length(trim(slug)) > 0),
  descricao TEXT NOT NULL DEFAULT '',
  ordem INTEGER NOT NULL DEFAULT 0 CHECK (ordem >= 0),
  ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1))
);

CREATE TABLE materiais (
  id TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  slug TEXT NOT NULL UNIQUE CHECK (length(trim(slug)) > 0),
  ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1))
);

CREATE TABLE produtos (
  id TEXT PRIMARY KEY NOT NULL,
  colecao_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  slug TEXT NOT NULL UNIQUE CHECK (length(trim(slug)) > 0),
  descricao TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
  criado_em TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  atualizado_em TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  FOREIGN KEY (colecao_id)
    REFERENCES colecoes(id)
    ON DELETE RESTRICT,

  FOREIGN KEY (material_id)
    REFERENCES materiais(id)
    ON DELETE RESTRICT,

  CHECK (
    status <> 'publicado'
    OR length(trim(descricao)) > 0
  )
);

CREATE TABLE produto_imagens (
  id TEXT PRIMARY KEY NOT NULL,
  produto_id TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL
    CHECK (length(trim(cloudinary_public_id)) > 0),
  url TEXT NOT NULL CHECK (length(trim(url)) > 0),
  texto_alternativo TEXT NOT NULL
    CHECK (length(trim(texto_alternativo)) > 0),
  ordem INTEGER NOT NULL CHECK (ordem >= 0),

  FOREIGN KEY (produto_id)
    REFERENCES produtos(id)
    ON DELETE RESTRICT,

  UNIQUE (produto_id, ordem)
);

CREATE INDEX idx_produtos_colecao_status
  ON produtos (colecao_id, status);

CREATE INDEX idx_produtos_material_status
  ON produtos (material_id, status);

CREATE INDEX idx_produtos_status
  ON produtos (status);