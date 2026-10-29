CREATE TABLE sessoes_administrativas (
  token_hash TEXT PRIMARY KEY NOT NULL
    CHECK (
      length(token_hash) = 64
      AND token_hash NOT GLOB '*[^0-9a-f]*'
    ),

  administrador_id TEXT NOT NULL,

  criado_em INTEGER NOT NULL
    DEFAULT (unixepoch()),

  ultima_atividade_em INTEGER NOT NULL
    DEFAULT (unixepoch()),

  expira_em INTEGER NOT NULL,

  revogada_em INTEGER,

  FOREIGN KEY (administrador_id)
    REFERENCES administradores(id)
    ON DELETE RESTRICT,

  CHECK (ultima_atividade_em >= criado_em),

  CHECK (
    expira_em > criado_em
    AND expira_em <= criado_em + 86400
  ),

  CHECK (
    revogada_em IS NULL
    OR revogada_em >= criado_em
  )
);

CREATE INDEX idx_sessoes_administrador
  ON sessoes_administrativas (administrador_id);

CREATE INDEX idx_sessoes_expiracao
  ON sessoes_administrativas (expira_em);
  