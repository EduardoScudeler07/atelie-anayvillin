CREATE TABLE reservas_login (
  escopo TEXT NOT NULL
    CHECK (escopo IN ('usuario', 'ip')),

  chave_hash TEXT NOT NULL
    CHECK (
      length(chave_hash) = 64
      AND chave_hash NOT GLOB '*[^0-9a-f]*'
    ),

  reserva_hash TEXT NOT NULL
    CHECK (
      length(reserva_hash) = 64
      AND reserva_hash NOT GLOB '*[^0-9a-f]*'
    ),

  criado_em INTEGER NOT NULL,

  expira_em INTEGER NOT NULL,

  PRIMARY KEY (escopo, chave_hash),

  CHECK (
    expira_em > criado_em
    AND expira_em <= criado_em + 60
  )
);

CREATE INDEX idx_reservas_login_expiracao
  ON reservas_login(expira_em);