# Autenticação administrativa — V1

## Objetivo

Proteger o painel e todas as operações administrativas da API.

O catálogo público continua acessível sem cadastro.

## Contas e permissões

- Duas contas individuais: cliente e desenvolvedor.
- Login por e-mail e senha.
- Sem cadastro público.
- Mesmas permissões para gerenciar o catálogo.
- Contas podem ser desativadas.
- A criação de contas será um procedimento controlado,
  separado da API pública.
- Alterações de senha, conta e recuperação exigem
  verificações próprias; não são permissões comuns do catálogo.

## Senhas

- Nunca armazenar senha em texto puro.
- Usar algoritmo próprio para senhas, com salt individual.
- Algoritmo e parâmetros serão escolhidos e testados
  no ambiente Cloudflare antes da implementação.
- Não usar SHA-256 sozinho para armazenar senhas.
- Não registrar senhas em logs, Git ou arquivos SQL.
- Permitir uso de gerenciadores de senhas e colagem.
- Definir limites de tamanho sem truncar silenciosamente.
- Não remover espaços nem modificar a senha recebida.

## Proteção contra injeção SQL

- Validar tipo, tamanho e formato das entradas.
- Usar consultas parametrizadas com bind.
- Nunca concatenar entrada do usuário ao SQL.
- Símbolos e aspas na senha serão tratados como dados.
- A segurança não depende de proibir caracteres especiais.

## Limitação de tentativas

Política aprovada:

- Cinco falhas em uma janela de 15 minutos.
- Após a quinta falha, bloquear novas tentativas
  da conta por 15 minutos.
- Aplicar também proteção por origem/IP.
- Contadores e bloqueios controlados no servidor.
- Não depender de estado no navegador.
- Não bloquear contas permanentemente por falhas de login.
- Requisições concorrentes não podem contornar o limite.
- Mensagens e respostas não devem revelar
  se um e-mail está cadastrado.
- Nunca registrar a senha nas tentativas.
- Definir retenção mínima necessária dos dados de proteção.

Os detalhes dos contadores, desbloqueio e limites por IP
serão revisados antes da implementação.

## Sessões

- Token aleatório gerado com fonte criptográfica segura.
- Cookie contém o token; banco armazena somente seu hash.
- Não guardar token em localStorage ou sessionStorage.
- Cookie HttpOnly, Secure em HTTPS e SameSite.
- Cookie sem Domain, limitado ao host correspondente.
- Validade, inatividade e revogação verificadas no servidor.
- Durações serão definidas antes da implementação.
- Login bem-sucedido gera uma nova sessão.
- Logout revoga a sessão atual e remove o cookie.
- Troca ou recuperação de senha invalida todas
  as sessões anteriores da conta.
- Desativar uma conta impede o uso de suas sessões.
- Respostas administrativas não devem ser armazenadas em cache.

A configuração de cookies no desenvolvimento HTTP local
será separada da configuração HTTPS de publicação.

## Autorização e requisições administrativas

- Verificar sessão e conta ativa em toda operação protegida.
- Não confiar apenas na proteção das páginas React.
- Verificar a origem e aplicar proteção CSRF adequada
  nas operações que alteram dados, incluindo os fluxos de acesso.
- GET não deve criar, editar, publicar ou excluir registros.
- Consultas e alterações devem validar as entradas no servidor.
- Retornar erros sem detalhes internos ou credenciais.
- Uploads futuros também exigirão autorização e validação.

## Recuperação assistida

Decisão: recuperação assistida na V1, sem serviço de e-mail.

Fluxo proposto:

1. Receber a solicitação por contato previamente combinado.
2. Confirmar a identidade antes de autorizar a recuperação.
3. Emitir um acesso temporário, de uso único e validade curta.
4. Entregar esse acesso pelo canal privado combinado.
5. A pessoa define a nova senha sem compartilhá-la.
6. Invalidar sessões anteriores ao concluir a redefinição.

Regras:

- Armazenar somente o hash do token de recuperação.
- Consumo do token deve ser atômico e impedir reutilização.
- Não ativar a conta automaticamente se estiver desativada.
- Não registrar tokens em logs ou documentação.
- Não depender de uma rota pública capaz de emitir
  recuperações para qualquer conta.
- A recuperação não fará login automático.
- Recuperação do próprio desenvolvedor terá procedimento
  controlado pela conta Cloudflare, sem depender
  de uma sessão administrativa ainda válida.

Prazos, canal de entrega e comandos de recuperação
serão aprovados antes da implementação.

## Ambientes

- Testar primeiro localmente e depois na prévia.
- Contas, sessões e tokens separados por banco.
- Cookies restritos ao host para não compartilhar
  sessões entre prévia e produção.
- Não usar senhas de produção nos testes.
- Não importar contas ou sessões por seeds públicos.
- Alterações em produção exigem autorização específica.

## Testes de aceite

- Credenciais corretas criam sessão.
- Credenciais incorretas não criam sessão.
- Quinta falha ativa o bloqueio aprovado.
- Reiniciar o navegador não remove o bloqueio.
- Tentativas concorrentes respeitam o limite.
- Conta inexistente não é revelada pela resposta.
- Sem sessão, APIs privadas recusam acesso.
- Sessão expirada, revogada ou de conta inativa é recusada.
- Logout invalida o acesso.
- Requisições de origem indevida são rejeitadas.
- Entradas semelhantes a SQL não alteram a consulta.
- Recuperação expirada ou já utilizada é recusada.
- Troca de senha invalida sessões anteriores.
- Credenciais e tokens não aparecem nas respostas ou logs.

## Prazos de autenticação

- Sessão expira após 2 horas sem requisições administrativas
  autenticadas ou 24 horas após o login, o que ocorrer primeiro.
- Recuperação de acesso válida por 15 minutos, com uso único.
- Logout, troca de senha e desativação podem encerrar
  o acesso antes desses prazos.

## Referências

- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://developers.cloudflare.com/d1/worker-api/prepared-statements/

## Primeiro acesso

- Contas criadas por procedimento controlado, sem cadastro público.
- Cada pessoa recebe um link de uso único para definir sua senha.
- Link válido por 15 minutos; se expirar, será necessário emitir outro.
- Conta sem senha definida não pode autenticar.
- Primeiro acesso não faz login automático.
- Tokens não serão registrados em logs, Git ou documentação.

## Resultado do teste remoto de PBKDF2

- Node e runtime local aceitaram 600 mil iterações.
- Runtime remoto recusou valores acima de 100 mil,
  retornando NotSupportedError.
- PBKDF2-HMAC-SHA256 com os parâmetros avaliados não será
  adotado nessa arquitetura.
- Não reduzir a proteção para contornar a restrição.
- Função temporária removida do código.
- Segredo AUTH_PROBE_SECRET removido da configuração de Preview.
- Próxima avaliação: serviço de autenticação gratuito,
  sem escolha ou contratação aprovada ainda.