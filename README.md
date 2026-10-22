# Ateliê Anayvillin

Site institucional e catálogo digital de terços artesanais.

## Estado atual

Etapa 2: página mínima publicada no Cloudflare Pages.
Produção e prévia verificadas manualmente.

## Escopo da V1

- Home, catálogo e página individual de produto.
- Busca e filtros por coleção e material.
- Catálogo sem preços.
- Contato por link do WhatsApp.
- Painel protegido para duas contas administrativas individuais.
- Sem carrinho, checkout, pagamentos, estoque ou gestão de pedidos.

## Tecnologias instaladas

- React e TypeScript.
- Vite.
- Bootstrap 5 e CSS personalizado.
- ESLint.
- Fontes locais via Fontsource: Playfair Display e Montserrat.

## Executar localmente

Abra um terminal na pasta `site`.

Na primeira execução após obter o código:

```sh
npm ci
```

Esse comando instala as versões registradas em `package-lock.json`.

Para iniciar o servidor de desenvolvimento:

```sh
npm run dev
```

Abra o endereço informado no terminal.
Para encerrar o servidor, pressione Ctrl + C.

## Verificações

Analisar o código:

```sh
npm run lint
```

Verificar o TypeScript e gerar a versão de publicação:

```sh
npm run build
```

Os arquivos gerados ficam em `dist`.
Gerar esses arquivos não publica o site.

## Organização atual

- `src/App.tsx`: conteúdo da página provisória.
- `src/App.css`: layout da página provisória.
- `src/index.css`: paleta e estilos gerais.
- `src/main.tsx`: inicialização do React e importação dos estilos.
- `index.html`: idioma, título e descrição da página.
- `docs/decisoes.md`: decisões e pendências do projeto.

## Materiais visuais

As pastas de identidade visual e fotografias ficam fora de `site`.
Preservar os arquivos originais.

Os mockups orientam o visual; não substituem componentes reais.
Logos e conteúdo definitivo dependem de confirmação.

## Segurança

Não incluir senhas, tokens ou chaves no código, na documentação
ou no Git. Configurações de serviços externos serão tratadas
nas etapas correspondentes.

## Infraestrutura proposta

- GitHub e Cloudflare Pages configurados.
- Pages Functions, D1 e Cloudinary ainda não configurados.
- Limites, condições e custos serão revistos antes de adicionar serviços.

## Validação realizada

- Página provisória aberta no navegador pelo desenvolvedor.
- Teste manual de redução da janela, sem rolagem horizontal
  relatada após o ajuste.
- ESLint executado sem apontamentos.
- Compilação concluída com sucesso.
- Título da aba confirmado após o ajuste do HTML.

Essas verificações não representam validação completa
de acessibilidade, segurança ou dispositivos.

## Publicação

Produção: https://atelie-anayvillin.pages.dev

Prévia verificada:
https://bf0db261.atelie-anayvillin.pages.dev

Esse link identifica uma publicação específica.
Novas publicações de prévia podem gerar outros endereços.

### Configuração do Cloudflare Pages

- Repositório: EduardoScudeler07/atelie-anayvillin.
- Branch de produção: `main`.
- Branch usada para testes: `preview`.
- Framework: React (Vite).
- Comando de compilação: `npm run build`.
- Diretório de saída: `dist`.
- Diretório raiz: raiz do repositório.
- Nenhuma variável de ambiente configurada nesta etapa.

### Fluxo de atualização

1. Desenvolver na branch `preview`.
2. Executar lint e build antes do envio.
3. Enviar os commits e conferir a publicação de prévia.
4. Após aprovação, integrar as alterações à `main`.

Envios à `main` atualizam automaticamente o site estável.

### Verificações da publicação inicial

- Produção aberta no computador e no celular pelo desenvolvedor.
- Prévia aberta e conferida pelo desenvolvedor.
- Cloudflare exibiu sucesso nos dois ambientes.