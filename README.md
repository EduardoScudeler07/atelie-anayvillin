# Ateliê Anayvillin

Site institucional e catálogo digital de terços artesanais,
com contato pelo WhatsApp e painel administrativo protegido.

## Estado atual

- Home, catálogo e páginas individuais publicados.
- Acervo de 29 peças publicadas em cinco coleções.
- Cadastro, edição de rascunhos e upload de fotos pelo painel.
- Revisão para publicar, arquivar e voltar a rascunho.
- WhatsApp e Instagram da cliente configurados em produção.
- Administração do catálogo sob responsabilidade de Eduardo.
- Infantil e conta administrativa da cliente adiados.

## Escopo da V1

- Catálogo sem preços.
- Busca e filtros por coleção e material.
- Peças feitas sob encomenda e possibilidades de personalização.
- Contato por link do WhatsApp, sem envio automático de mensagens.
- Sem carrinho, checkout, pagamentos, estoque ou gestão de pedidos.

## Endereços

- Produção: https://atelie-anayvillin.pages.dev
- Prévia: https://preview.atelie-anayvillin.pages.dev
- Painel oficial: https://atelie-anayvillin.pages.dev/admin
- Painel de prévia: https://preview.atelie-anayvillin.pages.dev/admin

O painel exige autenticação e aceita o endereço configurado para
cada ambiente. Links com identificador de uma publicação específica
não substituem os endereços fixos acima para acessar o painel.

## Tecnologias

- React, TypeScript e Vite.
- Bootstrap 5 e CSS personalizado.
- React Router.
- Fontes locais via Fontsource: Playfair Display e Montserrat.
- Cloudflare Pages e Pages Functions.
- Cloudflare D1 para dados do catálogo e controle administrativo.
- Cloudinary para armazenamento e entrega das fotos.
- Firebase Authentication para autenticação por e-mail e senha.
- ESLint e Wrangler para desenvolvimento e verificações.

## Organização

- `src/pages`: Home, catálogo, peça e páginas administrativas.
- `src/components`: componentes e seções da interface.
- `src/services`: comunicação do navegador com as APIs.
- `src/hooks`: carregamento de dados e comportamentos reutilizáveis.
- `src/config`: seleção da fonte de dados e links do WhatsApp.
- `src/types`: tipos compartilhados do front-end.
- `functions/api`: rotas públicas e administrativas.
- `server/auth`: autenticação, sessões e controle de tentativas.
- `server/admin`: regras de cadastro, edição, fotos e publicação.
- `server/media`: integração de upload com o Cloudinary.
- `migrations`: evolução da estrutura do banco.
- `seeds`: cadastros iniciais executados manualmente.
- `tests`: verificações automatizadas e bancos isolados.
- `docs`: decisões e documentação técnica.
- `scripts/auth`: ferramentas de preparação administrativa.

## Executar localmente

Abra o terminal na pasta do projeto, onde está `package.json`.

Instale as versões registradas no projeto:

```sh
npm ci
```

A instalação e a execução exigem uma versão de Node compatível
com as dependências. O desenvolvimento foi realizado com Node 24.

### Somente interface

```sh
npm run dev
```

Esse servidor atende à interface. Ele não executa as Pages Functions.

Para usar os dados temporários do front-end, configure em `.env.local`:

```dotenv
VITE_USE_PRODUCT_API=false
```

O arquivo `.env.example` apresenta as variáveis públicas disponíveis.

### Interface, API e painel

O banco local precisa estar preparado e as configurações do servidor
devem existir em `.dev.vars`.

Para aplicar migrações no banco local:

```sh
npx wrangler d1 migrations apply atelie-anayvillin-local --local --config wrangler.local.jsonc
```

Compile a interface e inicie o ambiente completo:

```sh
npm run build
npx wrangler pages dev dist --d1 DB=DB --persist-to .wrangler/state
```

Abra o endereço informado pelo Wrangler, normalmente:

```text
http://127.0.0.1:8788
```

Para consumir a API local, utilize `VITE_USE_PRODUCT_API=true`
em `.env.local` antes de compilar.

O banco local é separado dos bancos remotos. Executar migrações
não copia o acervo de produção nem cria automaticamente um administrador.

Após alterar a interface ou variáveis `VITE_`, compile novamente.
Reinicie o servidor quando necessário. Ctrl+C encerra o processo.

## Configurações por ambiente

### Variáveis públicas do front-end

- `VITE_USE_PRODUCT_API`: ativa o carregamento pela API.
- `VITE_WHATSAPP_NUMBER`: código do país, DDD e número, somente dígitos.

Variáveis `VITE_` ficam disponíveis no navegador e não podem conter
credenciais. O número do WhatsApp é público no destino dos links.

Sem número ou com formato inválido, os links do WhatsApp ficam ocultos.

### Configurações do servidor

- `ADMIN_ORIGIN`
- `FIREBASE_WEB_API_KEY`
- `AUTH_RATE_LIMIT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET`
- `CLOUDINARY_UPLOAD_FOLDER`

Use `.dev.vars` no ambiente local e as configurações de cada ambiente
no Cloudflare. Mantenha os segredos nos campos do tipo Secret.

`ADMIN_LOCAL_TEST_IP` é destinado exclusivamente ao teste local
em loopback. Não configurar em produção ou prévia remota.

O vínculo D1 é chamado `DB`. Prévia e produção usam bancos separados.

## Administração do catálogo

1. Acesse `/admin` pelo endereço fixo do ambiente.
2. Entre com seu usuário e sua senha.
3. Use “Nova peça” para cadastrar um rascunho.
4. Informe nome, coleção, material e descrição.
5. Em “Fotos”, envie a fotografia e seu texto alternativo.
6. Abra a revisão de publicação e confira os dados.
7. Confirme a publicação para exibir a peça no catálogo.

Formatos de upload: JPEG, PNG e WebP, com limite de 5 MiB por arquivo.

A primeira foto é a capa. Atualmente cada peça do acervo tem uma foto.
Não há ferramenta de exclusão ou reordenação de fotos nesta entrega.

Para editar uma peça publicada, volte-a a rascunho.
Ela sai do catálogo até ser publicada novamente.

Arquivar retira a peça do catálogo, preservando dados e fotos.
Uma peça arquivada pode voltar a rascunho para revisão.

Cadastros com nomes iguais recebem endereços distintos.
Confira a coleção e a foto antes de editar ou publicar.

## Autenticação e segurança

- A senha é verificada pelo Firebase e não é armazenada no D1.
- O usuário visível no painel é vinculado internamente à conta Firebase.
- Sessões usam tokens aleatórios; somente seus hashes ficam no banco.
- Cookie de sessão com HttpOnly, Secure e SameSite=Strict.
- Prazo absoluto da sessão de 24 horas e limite de inatividade de 2 horas.
- Controle de tentativas para usuário e IP.
- Cinco falhas dentro da janela de controle geram bloqueio de 15 minutos.
- Rotas administrativas verificam autenticação.
- Alterações verificam origem e formato da requisição.
- Consultas SQL usam parâmetros para os dados recebidos.
- Edição e mudanças de situação verificam a versão da peça.
- Upload assinado no servidor, com validação antes do envio ao Cloudinary.

Não colocar senhas, tokens, segredos, backups ou SQL com dados
administrativos no Git, no front-end ou nos logs.

`.env.local`, `.dev.vars`, `.private` e `.wrangler` são ignorados pelo Git.

## Verificações

```sh
npm run lint
npm run build
npx tsc -p functions/tsconfig.json
npx tsc -p tests/admin/tsconfig.json
npx tsc -p tests/auth/tsconfig.json
```

O build gera os arquivos em `dist`; ele não publica o site.

Os testes administrativos e de autenticação possuem cenários próprios.
Utilize os bancos isolados definidos em suas configurações.
Não aponte esses testes para produção.

Foram conferidos fluxos administrativos, proteção de acesso sem sessão,
navegação por teclado e uso em celular real.

Essas verificações não equivalem a uma auditoria independente completa
de segurança ou acessibilidade.

## Publicação

- Repositório: EduardoScudeler07/atelie-anayvillin.
- Branch estável: `main`.
- Branch de testes: `preview`.
- Framework no Pages: React (Vite).
- Comando de build: `npm run build`.
- Diretório de saída: `dist`.
- Diretório raiz: raiz do repositório.

Fluxo:

1. Desenvolver na `preview`.
2. Executar as verificações adequadas.
3. Enviar a branch e conferir a publicação de prévia.
4. Abrir pull request para `main`.
5. Revisar os checks e obter aprovação.
6. Fazer o merge e conferir produção.

O merge na `main` inicia automaticamente a publicação de produção.

Variáveis, segredos, vínculos e bancos não são copiados pelo Git.
Mudanças nas variáveis de build exigem nova compilação.

## Backup

O banco é exportado pelo Wrangler para SQL. O arquivo contém dados
administrativos e deve ser guardado de forma privada.

Em 2026-10-30, o backup foi restaurado em banco local isolado:
29 peças publicadas, 29 referências de imagens, nenhuma peça sem foto,
`quick_check` sem erros e nenhuma violação de chave estrangeira retornada.

O SQL não contém os arquivos das fotos. Preserve também:
- fotos originais e editadas;
- identidade visual;
- uma cópia privada dos arquivos necessários para recuperação.

O GitHub guarda o código versionado, não substitui o backup do banco
nem o acervo fotográfico.

Não importar um backup em produção sem conferir destino, conteúdo,
impacto e cópia de segurança atual.

## Serviços e manutenção

O projeto utiliza os planos gratuitos configurados durante o desenvolvimento.
Monitorar consumo e limites nos painéis do Cloudflare, Cloudinary e Firebase.

Não ativar faturamento, upgrades ou serviços adicionais sem autorização.
Limites e condições dos provedores podem mudar.

## Referências visuais e decisões

Mockups são referências para os componentes reais, não substitutos da interface.
Preservar fotografias, logos e arquivos originais.

As decisões, aprovações e pendências estão registradas em `docs/decisoes.md`.
Documentação complementar:
- `docs/autenticacao.md`
- `docs/banco-de-dados.md`

Guia de operação e manutenção: `docs/operacao.md`.

Organização e execução dos testes: `tests/README.md`.