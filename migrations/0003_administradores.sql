CREATE TABLE administradores (
  id TEXT PRIMARY KEY NOT NULL,

  nome TEXT NOT NULL
    CHECK (length(trim(nome)) > 0),

  usuario TEXT NOT NULL COLLATE NOCASE UNIQUE
    CHECK (
      length(usuario) BETWEEN 3 AND 40
      AND usuario = lower(usuario)
      AND usuario NOT GLOB '*[^a-z0-9._-]*'
    ),

  email_firebase TEXT NOT NULL COLLATE NOCASE UNIQUE
    CHECK (length(trim(email_firebase)) > 0),

  firebase_uid TEXT NOT NULL UNIQUE
    CHECK (length(trim(firebase_uid)) > 0),

  ativo INTEGER NOT NULL DEFAULT 0
    CHECK (ativo IN (0, 1)),

  criado_em TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  atualizado_em TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);