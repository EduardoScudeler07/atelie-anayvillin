CREATE TABLE tentativas_login (
  escopo TEXT NOT NULL
    CHECK (escopo IN ('usuario', 'ip')),

  chave_hash TEXT NOT NULL
    CHECK (
      length(chave_hash) = 64
      AND chave_hash NOT GLOB '*[^0-9a-f]*'
    ),

  falhas INTEGER NOT NULL DEFAULT 0
    CHECK (falhas >= 0),

  janela_inicio_em INTEGER NOT NULL,

  bloqueado_ate INTEGER,

  atualizado_em INTEGER NOT NULL,

  PRIMARY KEY (escopo, chave_hash),

  CHECK (atualizado_em >= janela_inicio_em),

  CHECK (
    bloqueado_ate IS NULL
    OR bloqueado_ate > janela_inicio_em
  )
);

CREATE INDEX idx_tentativas_login_atualizacao
  ON tentativas_login(atualizado_em);