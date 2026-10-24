# Registro de decisões

## Forma de trabalho

- Desenvolvimento guiado, em passos pequenos.
- Explicar alterações antes da execução.
- Avançar somente com autorização do usuário.
- Registrar verificações e limitações.

## Base do projeto

- Código na subpasta `site`, separado do acervo visual.
- Acompanhamento pelo VS Code.
- React, TypeScript e Vite.
- Bootstrap 5 importado antes dos estilos personalizados.
- Playfair Display 500 para títulos.
- Montserrat 400 para textos e interface.
- Fontes servidas junto da aplicação via Fontsource.
- Paleta definida no PDF de especificação V1.
- Idioma do HTML: português do Brasil.

## Interface e escopo

- PDF como referência principal de requisitos.
- Imagens como referência visual para componentes reais.
- Prioridade para o catálogo mobile aprovado.
- Filtros por coleção e material, conforme o PDF.
- Favoritos dos mockups não foram incorporados ao escopo.
- Home sem seção separada de produtos em destaque.
- Sem preços, carrinho, checkout, pagamentos, estoque
  ou gestão de pedidos.
- Encomendas por link do WhatsApp.

## Preservação dos materiais

- Não modificar os arquivos originais sem autorização.
- Não usar imagens artificiais de produtos no resultado final.
- Não presumir aprovação definitiva das logos.
- Não tratar nomes de arquivos como nomes comerciais aprovados.

## Pendências

- Aprovação da logo definitiva.
- Conteúdo institucional e dados reais dos produtos.
- Contatos oficiais.
- Confirmação de múltiplos materiais por produto.
- Titularidade e acessos das contas externas.
- Validação da infraestrutura proposta e dos planos gratuitos.
- Definição de privacidade, domínio e backups.

## Publicação inicial

- Repositório público autorizado para uso como portfólio.
- Código versionado somente a partir da pasta `site`.
- Cloudflare Pages conectado ao repositório do projeto.
- `main` definida como branch de produção.
- `preview` usada para revisão antes de atualizar produção.
- Publicação automática após envio às branches configuradas.
- Endereço gratuito `.pages.dev`, sem compra de domínio.
- Nenhum serviço pago autorizado.
- Produção e prévia verificadas manualmente.
- Titularidade definitiva das contas permanece pendente.

## Estrutura compartilhada da interface

- Cabeçalho e rodapé separados em componentes.
- SiteLayout recebe o conteúdo da página pela propriedade children.
- O layout contém o elemento main e organiza a altura da página.
- Novos componentes usam arquivos com inicial minúscula,
  mantendo os nomes dos componentes React com inicial maiúscula.
- Cabeçalho usa o nome em texto enquanto a logo definitiva
  permanece pendente de aprovação.
- Verificação local relatada pelo desenvolvedor:
  conteúdo exibido, ausência de rolagem horizontal em janela
  estreita, lint e build concluídos sem erros.

  ## Correção do import de estilos do layout

- A compilação de prévia falhou por diferença entre
  `SiteLayout.css` no import e `siteLayout.css` no arquivo.
- Import corrigido para corresponder exatamente ao nome do arquivo.
- Compilação local passou após a correção.
- Compilação no Cloudflare passou após a correção.
- Conteúdo da prévia conferido pelo desenvolvedor.

## Rotas e início visual do catálogo

- React Router instalado e conectado por BrowserRouter.
- Rota `/` preserva a apresentação provisória.
- Rota `/catalogo` exibe título, subtítulo e divisor decorativo.
- Cabeçalho permite navegar entre início e catálogo.
- Desenvolvimento visual começa pelo catálogo, seguido
  da página de produto e da Home.
- Testes locais realizados pelo desenvolvedor:
  navegação, voltar/avançar, foco e acionamento por teclado,
  janela estreita sem rolagem horizontal, lint e build.
- Prévia validada pelo desenvolvedor: navegação, acesso direto
  a `/catalogo`, atualização da página e teste no celular,
  sem rolagem horizontal.

  ## Atualização das coleções e nomes

- Coleções confirmadas com a cliente: Essência, Promessa,
  Luz, Graça, Raízes e Infantil.
- Essa lista substitui a lista de cinco coleções do PDF V1.
- Materiais permanecem: Pérolas, Cristais e Raízes.
- Fotos editadas estão organizadas por coleção e possuem
  fundo padronizado em #F5EDE5.
- O padrão dos nomes será definido com o desenvolvedor
  no passo dos cards; ainda não há nomes finais aprovados.

  ## Busca e filtros do catálogo

- Busca por nome mantida após revisão visual.
- Busca compacta e arredondada.
- Atalhos visíveis: Todas, Essência, Graça e Luz,
  sem faixa de rolagem horizontal.
- Clicar novamente na coleção selecionada desmarca.
- Todas limpa somente a coleção, preservando busca e material.
- Ícone abaixo do cabeçalho abre painel lateral.
- Painel contém todas as seis coleções e os três materiais.
- Escolhas no painel são aplicadas por Ver peças.
- Fechar pelo botão, Esc ou fundo descarta mudanças provisórias.
- Limpar tudo prepara a remoção de busca e filtros,
  efetivada ao confirmar em Ver peças.
- Etiquetas permitem remover coleção e material individualmente.
- Painel usa dialog nativo, com animação de entrada e respeito
  à preferência de movimento reduzido; saída ainda imediata.
- Interações locais verificadas pelo desenvolvedor.
- Lint e build concluídos sem erros.
- Compilação de prévia concluída com sucesso.
- Busca, atalhos, painel e etiquetas verificados online
  pelo desenvolvedor, inclusive no celular.

  ## Revisão das fotografias

- Novo fundo das fotos: #EDE0D5, substituindo #F5EDE5.
- Acervo editado organizado em cinco coleções.
- Fotos de Infantil ficam para depois; a coleção permanece prevista.
- Amostra local com uma foto de cada coleção.
- Cópias para o site preservam as subpastas por coleção,
  evitando conflito entre nomes de arquivos iguais.
- Arquivos anteriores preservados.
- Nomes das amostras de Luz e Graça provisórios.
- Amostra de cinco cards conferida visualmente pelo desenvolvedor.
- Lint e build passaram após adicionar os cards e a logo.
- Logo, cinco cards e fotos revisados na prévia pelo desenvolvedor.
- Busca, filtros combinados, contagem e estado sem resultados
  verificados na prévia, inclusive no celular.
- Compilação no Cloudflare concluída com sucesso.

## Logo no cabeçalho

- Logo horizontal confirmada pelo usuário como aprovada pela cliente.
- Original preservado; cópia usada em public/images/marca.
- Logo funciona como link para a Home.
- Cabeçalho com espaçamento vertical de 12px.
- Largura da logo: 180px; em telas menores que 576px, 145px.
- Tamanho conferido visualmente pelo usuário.

## Filtragem dos produtos

- Busca por nome ignora diferenças de acentos e maiúsculas.
- Busca, coleção e material são combinados para filtrar os cards.
- Raízes permanece como coleção; Madeira identifica o material.
- Catálogo mostra a quantidade de peças encontradas.
- Combinações sem resultados exibem uma mensagem explicativa.
- Testes locais de busca, filtros combinados e limpeza passaram.
- Lint e build concluídos sem erros.
- Validação da filtragem na prévia ainda pendente.

## Página individual do produto

- Rota `/produto/:slug` consulta os dados locais.
- Foto e nome dos cards abrem a peça correspondente.
- Página segue a referência visual de produto, com foto inteira,
  nome, coleção, materiais e indicação de encomenda.
- Produto inexistente exibe mensagem e link para o catálogo.
- Uma foto por produto neste passo, sem controles de galeria.
- Descrições e contato oficial permanecem pendentes.
- Número da cliente será incluído somente na revisão final.
- Navegação e apresentação local verificadas pelo desenvolvedor.
- Lint e build concluídos sem erros.
- Compilação da prévia passou.
- Links dos cards, acesso direto, atualização da página,
  produto inexistente e apresentação no celular verificados
  na prévia pelo desenvolvedor.

  ## Abertura da Home

- Chamada escolhida: “Cada laço, uma oração.
  Cada terço, uma história.”
- Apresentação centralizada, sem foto ou espaço reservado.
- Fotografias entrarão na seção Nossas coleções.
- Botão Conheça o catálogo direciona para /catalogo.
- Layout e navegação conferidos localmente pelo desenvolvedor,
  incluindo celular.
- Lint e build concluídos sem erros.
- Compilação da prévia passou.
- Home e acesso ao catálogo conferidos na prévia pelo
  desenvolvedor, no computador e no celular.

  ## Seção Nossas coleções

- Cinco coleções na Home; Infantil fica para depois.
- Descrições aprovadas pelo usuário.
- Cards com foto, descrição e link para o catálogo filtrado.
- Navegação manual por setas, indicadores e gesto horizontal.
- Sem reprodução automática.
- Coleção do catálogo sincronizada com o parâmetro colecao da URL.
- Lint e build concluídos sem erros.
- Prévia validada pelo desenvolvedor no celular:
  gesto horizontal, rolagem vertical, setas, indicadores
  e links para o catálogo filtrado funcionando.
- Compilação no Cloudflare concluída com sucesso.

## Seção Nossa história

- Texto escolhido pelo usuário para implementação local.
- Seção sem fotografia, abaixo de Nossas coleções.
- Origem do ateliê ligada ao pedido da avó ainda precisa
  ser confirmada com a cliente antes de publicar esta seção.
- Apresentação visual aprovada pelo usuário.
- Lint e build concluídos sem erros.
- Origem do ateliê ligada ao pedido da avó confirmada
  pelo usuário a partir do relato da cliente.

## Personalização

- Texto e chamada aprovados pelo usuário:
  “Sua fé, sua história, seu terço.”
- Opções confirmadas: cores, nomes, medalhas e materiais.
- Foto usada: terco-graca/terco-transparente-azul.png.
- Divulgação da personalização visível autorizada pelo usuário.
- Arquivo de origem preservado; cópia exibida sem recorte.
- Botão de contato será incluído na etapa de WhatsApp.
- Apresentação visual aprovada pelo usuário.
- Lint e build concluídos sem erros.

## Como encomendar

- Seção com três passos: encontrar uma inspiração,
  conversar com o ateliê e combinar os detalhes.
- Botão Encontre seu terço direciona ao catálogo.
- Nenhum prazo ou condição comercial foi presumido.
- Visual e textos aprovados pelo usuário.
- Contato por WhatsApp ainda não configurado.
- Lint e build concluídos sem erros.
- Home completa validada na prévia pelo desenvolvedor,
  no computador e no celular: ordem das seções, foto,
  links e carrossel funcionando, sem rolagem horizontal.
- Compilação no Cloudflare concluída com sucesso.

## Planejamento do D1

- Modelo do catálogo aprovado com quatro tabelas:
  colecoes, materiais, produtos e produto_imagens.
- Um material por produto na V1.
- Descrições próprias e editáveis, com tom afetivo.
- Publicação exige descrição e foto.
- Separação proposta entre local, prévia e produção.
- Limites gratuitos consultados em 24/10/2026.
- Nenhum banco criado ou SQL executado neste passo.
- Detalhes e pendências em banco-de-dados.md.

## Validação inicial do D1 local

- Wrangler 4.152.0 instalado no projeto.
- Configuração local em wrangler.local.jsonc.
- Migração 0001_catalogo.sql aplicada somente localmente.
- Quatro tabelas do catálogo criadas.
- Produto de teste criado como rascunho, com data automática.
- Publicação sem descrição bloqueada por CHECK.
- Slug duplicado bloqueado por UNIQUE.
- Coleção inexistente bloqueada por chave estrangeira.
- Status inválido bloqueado por CHECK.
- Exclusão de coleção em uso bloqueada por chave estrangeira.
- Validação da ordem das imagens ainda pendente.
- Dados de teste permanecem somente no banco local.
- Nenhum banco remoto criado; site público permanece igual.