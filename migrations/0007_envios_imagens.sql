CREATE TABLE envios_imagens (
  id TEXT PRIMARY KEY NOT NULL,

  produto_id TEXT NOT NULL,
  administrador_id TEXT NOT NULL,

  cloudinary_public_id TEXT NOT NULL UNIQUE
    CHECK (
      length(trim(cloudinary_public_id)) > 0
      AND length(cloudinary_public_id) <= 240
    ),

  texto_alternativo TEXT NOT NULL
    CHECK (
      length(trim(texto_alternativo)) > 0
      AND length(texto_alternativo) <= 240
    ),

  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'concluido', 'falhou')),

  erro_codigo TEXT NOT NULL DEFAULT ''
    CHECK (length(erro_codigo) <= 80),

  criado_em INTEGER NOT NULL DEFAULT (unixepoch()),
  atualizado_em INTEGER NOT NULL DEFAULT (unixepoch()),

  FOREIGN KEY (produto_id)
    REFERENCES produtos(id)
    ON DELETE RESTRICT,

  FOREIGN KEY (administrador_id)
    REFERENCES administradores(id)
    ON DELETE RESTRICT,

  CHECK (atualizado_em >= criado_em)
);

CREATE INDEX idx_envios_imagens_produto
  ON envios_imagens(produto_id, criado_em);

CREATE INDEX idx_envios_imagens_status
  ON envios_imagens(status, criado_em);