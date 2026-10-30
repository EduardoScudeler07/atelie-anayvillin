# Testes

Esta pasta contém verificações da implementação atual.
Os experimentos abandonados de PBKDF2 foram removidos.
A decisão de usar Firebase permanece registrada em docs/decisoes.md.

## Organização

- auth: autenticação, sessões, cookies e controle de tentativas.
- admin: cadastro, edição, upload e publicação das peças.

Arquivos terminados em worker.ts são pontos de entrada para
testes no runtime local do Cloudflare.

Arquivos auxiliares, como login-expiration-tests.ts,
login-rejection-tests.ts e session-completion-tests.ts,
são chamados por outros testes e devem ser preservados.

Scripts de preparação de administradores e geração do segredo
local ficam em scripts/auth, pois são ferramentas operacionais.

## Verificar os tipos

Execute na raiz do projeto:

```sh
npx tsc -p tests/auth/tsconfig.json
npx tsc -p tests/admin/tsconfig.json
```

## Testes sem credenciais ou banco

Com uma versão de Node compatível com TypeScript nativo,
como a versão 24 usada no desenvolvimento:

```sh
node tests/auth/session-token.test.mjs
node tests/auth/session-cookie.test.mjs
node tests/auth/login-keys.test.mjs
node tests/auth/admin-request.test.mjs
node tests/auth/firebase-auth.test.mjs
```

O teste unitário do Firebase simula as respostas do provedor.
Ele não usa uma conta real.

## Testes com banco local isolado

Nunca apontar esses testes para o banco de produção.

Preparar a estrutura do banco de testes:

```sh
npx wrangler d1 migrations apply atelie-session-tests --local --config tests/auth/wrangler.sessions.jsonc --persist-to .wrangler/session-tests
```

Exemplo: iniciar o teste das mudanças de situação de produtos:

```sh
npx wrangler dev tests/admin/product-status-worker.ts --config tests/auth/wrangler.sessions.jsonc --persist-to .wrangler/session-tests --ip 127.0.0.1 --port 8790
```

Em outro terminal:

```sh
curl.exe -X POST http://127.0.0.1:8790/
```

A resposta informa passou e os cenários conferidos.
Se passar retornar false, verificar o terminal do servidor.

Encerrar o servidor com Ctrl+C antes de iniciar outro teste
na mesma porta.

## Cenários disponíveis

### Autenticação

- session-worker.ts: validade, expiração e atividade das sessões.
- logout-worker.ts: revogação e repetição segura do logout.
- login-reservations-worker.ts: reservas e concorrência.
- login-failures-worker.ts: contagem, bloqueio e expiração.
- login-release-worker.ts: liberação das reservas.
- session-creation-worker.ts: criação de sessão com autorização.
- login-flow-worker.ts: fluxo de login e recusas.

### Administração

- product-create-worker.ts: cadastro de rascunhos.
- product-edit-worker.ts: edição e controle de versão.
- image-upload-worker.ts: upload, validação e associação da foto.
- product-status-worker.ts: publicação, arquivamento e retorno a rascunho.

Para executar outro cenário, substituir somente o caminho
do worker no comando de inicialização.

Esses testes usam registros próprios. Quando o cenário possui
limpeza automática, ela é limitada aos registros criados por ele.

## Verificações manuais com serviços reais

- firebase-auth-live.ps1 e firebase-auth-live.mjs:
  verificação da integração com a conta de teste do Firebase.
- login-route-live.ps1: resposta HTTP e atributos do cookie de login.
- login-logout-live.ps1: ciclo HTTP local de login e logout.
- admin/cloudinary-config-probe.mjs:
  consulta da configuração do preset no Cloudinary.

Essas verificações possuem requisitos próprios e não fazem parte
dos testes unitários sem credenciais. Conferir destino e configuração
antes de executá-las.

Não usar senhas de produção nos testes.
Não publicar credenciais, cookies ou tokens nas saídas.

## Ferramentas operacionais

Executar a partir da raiz do projeto:

- scripts/auth/create-rate-limit-secret.mjs
- scripts/auth/prepare-preview-admin.ps1
- scripts/auth/prepare-production-admin.ps1

Os arquivos privados gerados por essas ferramentas não pertencem ao Git.

## Limite das verificações

Os testes ajudam a detectar regressões nos cenários implementados.
Eles não equivalem a uma auditoria independente completa de segurança.