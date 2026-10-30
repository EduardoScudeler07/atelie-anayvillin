# Autenticação administrativa — V1

## Implementação atual

A interface solicita usuário e senha.

O servidor consulta o administrador autorizado no D1 e utiliza
o e-mail interno associado a ele para autenticar no Firebase.

O acesso administrativo exige:
- credenciais aceitas pelo Firebase;
- UID correspondente ao administrador cadastrado;
- conta ativa no D1;
- controles de tentativas e reservas válidos.

Criar uma conta no Firebase, sozinho, não concede acesso ao painel.

## Responsável

Eduardo administra e atualiza o catálogo.
A conta da cliente foi adiada conforme alinhamento.

Não existe cadastro público de administradores pelo site.

## Senhas

- Firebase Authentication verifica e armazena as senhas.
- O D1 não armazena senha nem hash de senha.
- Política de produção configurada para 15 a 128 caracteres.
- A senha não é normalizada, aparada ou truncada pelo servidor.
- Não registrar senhas em logs, código, SQL ou documentação.
- O navegador não recebe os tokens do Firebase como credenciais
  das APIs administrativas.
- Não existe alternativa de autenticação por senha local
  caso o provedor esteja indisponível.

Os experimentos de armazenamento próprio com PBKDF2 foram abandonados.
O motivo e a mudança de arquitetura permanecem no registro de decisões.

## Sessões

Após autenticação e autorização, o servidor gera uma sessão própria.

- Token aleatório com 32 bytes gerados por fonte criptográfica segura.
- Cookie contém o token.
- D1 armazena somente o hash SHA-256 desse token.
- Token não fica em localStorage ou sessionStorage.
- Cookie: __Host-atelie_admin.
- Atributos: Path=/, HttpOnly, Secure e SameSite=Strict.
- Sem atributo Domain.
- Prazo absoluto de 24 horas.
- Inatividade máxima de 2 horas.
- Verificação de expiração, revogação e administrador ativo no servidor.
- Logout revoga a sessão atual e solicita remoção do cookie.
- Desativar o administrador impede o uso das suas sessões.

SHA-256 é usado para identificar tokens aleatórios de sessão,
não para armazenar senhas.

## Troca e recuperação de senha

Não há tela própria de recuperação ou troca de senha nesta versão.
A alteração de senha é feita pelos mecanismos do Firebase.

As sessões administrativas são próprias do site.
Portanto, trocar a senha no Firebase não revoga automaticamente
as sessões já emitidas no D1.

Em recuperação de acesso ou suspeita de comprometimento:

1. Confirmar a identidade do responsável.
2. Se necessário, desativar o administrador no D1.
3. Revogar suas sessões administrativas no D1.
4. Redefinir a senha pelos mecanismos do Firebase.
5. Conferir a identidade vinculada e a situação da conta.
6. Reativar somente após autorização e conferência.

Esse procedimento é operacional e controlado.
Não executar alterações de conta ou revogações por tentativa.

Reativar uma conta não substitui a revogação das sessões antigas.

## Tentativas de login

- Cinco falhas em uma janela de 15 minutos.
- Bloqueio de 15 minutos após a quinta falha.
- Proteção por usuário e por IP.
- Contadores controlados no servidor.
- Chaves de controle derivadas com HMAC-SHA256 e segredo do ambiente.
- Reservas temporárias evitam que concorrência contorne o controle.
- Uma mesma tentativa não deve registrar a falha repetidamente.
- Indisponibilidade do provedor não é tratada como senha incorreta.
- Respostas de recusa não informam se o usuário está cadastrado.

O segredo de controle deve ser diferente entre os ambientes.

Não há rotina agendada de limpeza dessas tabelas nesta entrega.
A manutenção e a retenção dos registros devem ser acompanhadas.

## Rotas

- POST /api/admin/login: autentica e cria sessão.
- GET /api/admin/session: verifica o acesso atual.
- POST /api/admin/logout: revoga a sessão atual.
- /api/admin/produtos e suas rotas:
  operações de catálogo protegidas por sessão.

As respostas administrativas usam Cache-Control: no-store.

O GET de sessão pode atualizar a atividade de uma sessão válida.
Consultas GET não publicam, editam ou arquivam produtos.

## Origem e validação

- APIs protegidas verificam sessão e administrador ativo.
- Requisições de alteração verificam a origem autorizada.
- Exigido o cabeçalho X-Atelie-Admin nas alterações.
- Content-Type, tamanho e estrutura do conteúdo são validados.
- Login aceita somente os campos esperados.
- Operações SQL utilizam parâmetros para os dados recebidos.
- Edição e mudança de situação verificam a versão da peça.
- Uploads exigem autorização e validação no servidor.

ADMIN_ORIGIN deve ser exatamente a origem do ambiente,
sem barra no final.

Por esse motivo, o painel deve ser acessado pelo endereço fixo
de produção ou prévia, não por um endereço de deploy com prefixo.

## Configuração

Servidor:
- FIREBASE_WEB_API_KEY
- AUTH_RATE_LIMIT_SECRET
- ADMIN_ORIGIN
- vínculo D1 chamado DB

No desenvolvimento, utilizar .dev.vars.
No Cloudflare, utilizar os campos de configuração do ambiente.

ADMIN_LOCAL_TEST_IP é exclusivo dos testes HTTP locais em loopback.
Não configurar essa variável na prévia remota ou em produção.

Nunca usar prefixo VITE_ para credenciais do servidor.

## Ambientes

- Banco local separado dos bancos remotos.
- Prévia e produção com bancos e projetos Firebase distintos.
- Contas autorizadas cadastradas separadamente.
- Cookies limitados ao host correspondente.
- Senhas de produção não devem ser utilizadas nos testes.

## Testes e limites

Os testes cobrem tokens, cookies, sessões, revogação,
controle de tentativas, reservas, concorrência e fluxo de login.

Acesso sem sessão, login, atualização da página e logout foram
conferidos também nos ambientes publicados.

Consulte tests/README.md para os comandos e os cenários disponíveis.

As verificações realizadas não equivalem a uma auditoria independente
completa de segurança, nem eliminam a necessidade de manutenção.