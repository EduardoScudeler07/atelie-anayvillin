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
- Ordem das imagens validada localmente: duas imagens do mesmo
  produto não podem ocupar a mesma posição.
- Referência fictícia criada para o teste removida; consulta
  confirmou zero imagens associadas ao produto de teste.
- Dados de teste permanecem somente no banco local.
- Nenhum banco remoto criado; site público permanece igual.

## D1 remoto de prévia

- Banco atelie-anayvillin-preview criado no Cloudflare.
- Localização automática, sem jurisdição específica.
- Configuração separada em wrangler.preview.jsonc.
- Wrangler autenticado com leitura de conta e usuário
  e acesso de escrita ao D1.
- Migração 0001_catalogo.sql aplicada ao banco remoto de prévia.
- Quatro tabelas do catálogo confirmadas por consulta.
- Dados fictícios dos testes locais não foram importados.
- Site ainda usa os dados locais; API não conectada.
- Banco de produção ainda não criado.

## Dados iniciais de coleções e materiais

- Migração 0002_colecoes_materiais.sql aplicada localmente
  e no banco remoto de prévia.
- Seis coleções cadastradas com IDs estáveis.
- Infantil cadastrada como inativa, sem descrição,
  até a preparação de seu conteúdo.
- Demais coleções ativas, com descrições aprovadas.
- Materiais ativos: Pérolas, Cristais e Madeira.
- Dados conferidos por consulta nos dois ambientes.
- Nenhum produto ou imagem adicionado nesta migração.
- Site público permanece usando os dados locais.

## API local de coleções

- Pages Function em functions/api/colecoes.ts.
- GET /api/colecoes retorna somente coleções ativas,
  ordenadas por ordem e nome.
- Métodos diferentes de GET recebem 405 e Allow: GET.
- Falhas retornam mensagem genérica, sem detalhes internos.
- TypeScript das Functions verificado separadamente.
- Teste local retornou as cinco coleções oficiais.
- Coleção fictícia dos testes desativada somente localmente.
- Pages local iniciado com:
  npx wrangler pages dev dist --d1 DB=DB --persist-to .wrangler/state
- Pages dev não aceita nosso caminho personalizado de configuração.
- React ainda não consome a API.
- API remota ainda não publicada.

## Ligação da API ao D1 de prévia

- Binding DB configurado somente no ambiente Preview do Pages.
- Banco selecionado: atelie-anayvillin-preview.
- Ligação entrará em vigor na próxima publicação.
- Produção não recebeu binding de banco.
- Typescript das Functions, lint e build passaram localmente.
- Arquivos gerados do Wrangler excluídos do lint.
- API validada na prévia: cinco coleções ativas retornadas
  na ordem correta, sem dados fictícios.
- Home e catálogo continuam funcionando.
- React ainda utiliza os dados locais.

## API local de materiais

- GET /api/materiais retorna materiais ativos em ordem alfabética.
- Resposta local conferida: Cristais, Madeira e Pérolas.
- Material fictício de teste desativado somente localmente.
- POST bloqueado com 405 e Allow: GET.
- TypeScript da função verificado sem erros.
- API de materiais validada na prévia: Cristais, Madeira e Pérolas.
- API de coleções, Home e catálogo continuam funcionando.
- Compilação no Cloudflare concluída com sucesso.
- React continua usando os dados locais.

## Primeiro teste do Cloudinary

- Plano Free confirmado, sem cartão ou serviços pagos.
- Pasta de mídia: atelie-anayvillin-preview.
- Uma foto real enviada, preservando o arquivo local.
- Arquivo: terco-essencia/terco-azul.png.
- Public ID: terco-azul.
- URL: https://res.cloudinary.com/lbspaasm/image/upload/v1792939118/terco-azul.png
- Imagem PNG de 1200 × 1200, sem edições no Cloudinary.
- Acesso público conferido pelo desenvolvedor em aba anônima.
- Pasta e Public ID são informações distintas nesta configuração.
- Nenhuma credencial adicionada ao projeto.
- Public ID: essencia/terco-azul.
- URL: https://res.cloudinary.com/lbspaasm/image/upload/v1792939118/essencia/terco-azul.png
- Padrão de Public ID aprovado: colecao/nome-do-arquivo,
  sem acentos e sem extensão.
- Nova URL conferida pelo usuário em aba anônima.

## Teste de entrega redimensionada

- Testada a transformação c_limit,w_600 na foto terco-azul.
- Peça exibida inteira, conforme conferência do usuário.
- Arquivo enviado ao Cloudinary preservado.
- Nenhuma imagem do site substituída neste passo.

## Primeiro produto com imagem do Cloudinary

- Terço Pérola Azul cadastrado somente no D1 local, como rascunho.
- Coleção Essência e material Pérolas.
- Descrição afetiva aprovada pelo usuário.
- Imagem real do Cloudinary associada na posição 0.
- Public ID: essencia/terco-azul.
- Produto, classificação e imagem conferidos por consulta.
- Arquivos de cadastro seguem o padrão:
  numero_terco_colecao_material_cor.sql.

  ## API local de produtos

- GET /api/produtos lista somente produtos publicados,
  com coleção e material ativos e foto de capa.
- Retorna dados públicos, sem IDs internos ou status.
- Rascunho não apareceu na resposta.
- Publicação temporária local exibiu o Terço Pérola Azul.
- Retorno a rascunho removeu a peça da resposta.
- POST bloqueado com 405 e Allow: GET.
- Produto permanece como rascunho no banco local.
- Validação remota ainda pendente.
- React continua usando os dados locais.
- API validada na prévia: lista vazia, pois o banco remoto
  ainda não recebeu produtos.
- Home e catálogo continuam funcionando.
- Compilação no Cloudflare concluída com sucesso.

## Cadastro e publicação de teste na prévia

- Terço Pérola Azul e sua imagem cadastrados no D1 remoto de prévia.
- Dados conferidos por consulta.
- Rascunho não apareceu em GET /api/produtos.
- Publicação temporária exibiu a peça com os dados corretos.
- Retorno a rascunho removeu a peça da resposta.
- Produto permanece como rascunho na prévia.
- Nenhuma alteração no banco ou site de produção.

## Serviço React de leitura dos produtos

- Serviço criado em src/services/productsApi.ts.
- Consulta GET /api/produtos e adapta a resposta ao tipo Product.
- Valida os campos recebidos e rejeita slugs duplicados.
- Usa o slug como identificador visual, sem expor o ID do banco.
- Lista vazia e adaptação do Terço Pérola Azul testadas localmente.
- Produto retornado a rascunho após o teste.
- Lint e build concluídos sem erros.
- Serviço ainda não conectado ao catálogo.

## API local de produto individual

- GET /api/produtos/:slug consulta produto publicado,
  com coleção e material ativos e pelo menos uma foto.
- Retorna descrição e imagens ordenadas, sem ID interno.
- Slug passado por consulta parametrizada.
- Rascunho e slug inexistente retornaram 404.
- Publicação temporária local retornou 200 com os dados da peça.
- Produto retornado a rascunho; consulta voltou a retornar 404.
- POST bloqueado com 405 e Allow: GET.
- Consulta individual validada na prévia remota.
- Rascunho e slug inexistente não foram expostos.
- Publicação temporária retornou os dados e a foto da peça.
- Produto retornado a rascunho e novamente oculto na API.
- Home e catálogo continuam funcionando.
- Página React ainda utiliza os dados locais.

## Serviço React de produto individual

- Tipos ProductImage e ProductDetails adicionados.
- getProductBySlug consulta a API e adapta descrição e fotos.
- Resposta 404 retorna null; outras falhas geram erro.
- Imagens validadas e ordenadas; primeira usada como capa.
- Rascunho e produto publicado testados localmente.
- Produto retornado a rascunho após o teste.
- Lint e build concluídos sem erros.
- Serviço ainda não conectado à página React.

## Integração local da página de produto

- Página individual consulta a API quando
  VITE_USE_PRODUCT_API=true.
- Opção ausente ou diferente de true mantém os dados locais.
- .env.local usado somente no computador, fora do Git.
- Rascunho exibiu Produto não encontrado.
- Publicação temporária local exibiu foto do Cloudinary,
  descrição, coleção e material.
- Produto retornado a rascunho após o teste.
- Falha simulada sem binding DB exibiu mensagem de carregamento
  malsucedido, distinta de produto não encontrado.
- VITE_USE_PRODUCT_API=true configurada somente no Preview.
- Página individual validada na prévia, inclusive no celular.
- Publicação temporária exibiu foto e descrição corretamente.
- Retorno a rascunho voltou a exibir Produto não encontrado.
- Produção permanece usando os dados locais.
- Produção permanece usando os dados locais.
## Integração local do catálogo

- Hook useCatalogProducts carrega a lista pela API quando
  VITE_USE_PRODUCT_API=true.
- Configuração desativada mantém os dados locais.
- Busca, filtros, etiquetas e painel preservados.
- Estados de carregamento, erro, catálogo vazio e filtros
  sem resultados implementados.
- Card e página individual testados com publicação temporária local.
- Produto retornado a rascunho após os testes.
- Falha de carregamento testada sem binding DB.
- Servidor normal restaurado.
- Lint e build concluídos sem erros.
- Integração validada na prévia, inclusive no celular:
  card, busca, filtros e página individual funcionando.
- Produto retornado a rascunho após o teste remoto.
- Catálogo voltou ao estado vazio.
- Produção permanece usando os dados locais.

## Cadastro do Terço Pérola Branca

- Nome e descrição aprovados pelo usuário.
- Foto enviada sem edição ao Cloudinary.
- Public ID: promessa/terco-branco.
- URL pública conferida pelo usuário em aba anônima.
- Cadastro aplicado e consultado no D1 local e remoto de prévia.
- Coleção Promessa, material Pérolas e imagem na ordem 0.
- Produto permanece como rascunho nos dois ambientes.
- Produção não alterada.

## Cadastro do Terço Cristal Azul Royal

- Nome e descrição aprovados pelo usuário.
- Foto enviada ao Cloudinary sem edição.
- Public ID: luz/terco-azul-royal.
- URL pública conferida pelo usuário.
- Cadastro aplicado e consultado no D1 local e remoto de prévia.
- Coleção Luz, material Cristais e imagem na ordem 0.
- Produto permanece como rascunho nos dois ambientes.
- Produção não alterada.

## Cadastro do Terço Cristal Rosa Claro

- Nome e descrição aprovados pelo usuário.
- Foto enviada ao Cloudinary sem edição.
- Public ID: graca/terco-rosa-claro.
- URL pública conferida pelo usuário.
- Cadastro aplicado e consultado no D1 local e remoto de prévia.
- Coleção Graça, material Cristais e imagem na ordem 0.
- Produto permanece como rascunho nos dois ambientes.
- Produção não alterada.

## Cadastro do Terço Madeira Marrom

- Nome e descrição aprovados pelo usuário.
- Foto enviada ao Cloudinary sem edição.
- Public ID: raizes/terco-marrom.
- URL pública conferida pelo usuário.
- Cadastro aplicado e consultado no D1 local e remoto de prévia.
- Coleção Raízes, material Madeira e imagem na ordem 0.
- Produto permanece como rascunho nos dois ambientes.
- Cinco peças iniciais cadastradas; produção não alterada.

## Revisão conjunta das cinco peças

- Cinco produtos publicados temporariamente somente na prévia.
- Fotos, nomes, descrições e links conferidos pelo desenvolvedor.
- Busca e filtros por coleção e material verificados.
- Apresentação conferida no computador e no celular.
- Cinco produtos retornados a rascunho após os testes.
- Catálogo da prévia voltou ao estado vazio.
- Produção permanece usando os dados locais.

## Preparação do D1 de produção

- Banco atelie-anayvillin-production criado separadamente da prévia.
- Configuração em wrangler.production.jsonc.
- Identificação do banco conferida antes das alterações.
- Migrações 0001 e 0002 aplicadas sem erros.
- Quatro tabelas, seis coleções e três materiais conferidos.
- Infantil permanece inativa.
- Consulta confirmou zero produtos.
- Banco ainda não conectado ao Pages de produção.
- Site público continua usando os dados locais.

## Cinco produtos iniciais no D1 de produção

- Arquivos seeds 001 a 005 executados individualmente.
- Cinco produtos cadastrados como rascunho.
- Coleções, materiais e slugs conferidos por consulta.
- Cada produto possui uma imagem associada.
- Banco ainda não conectado ao Pages de produção.
- Site público permanece usando os dados locais.

## Ligação do Pages ao D1 de produção

- Binding DB configurado no ambiente Production.
- Banco selecionado: atelie-anayvillin-production.
- Ligação terá efeito na próxima publicação de produção.
- VITE_USE_PRODUCT_API ainda não ativada em produção.
- Cinco produtos permanecem como rascunho no banco.
- Interface pública permanece usando os dados locais.

## Ativação do catálogo integrado em produção

- Cinco produtos aprovados publicados no D1 de produção.
- Listagem e consulta individual verificadas na API pública.
- VITE_USE_PRODUCT_API=true configurada em Production.
- Produção recompilada após a configuração.
- Catálogo, busca, filtros, fotos e descrições conferidos
  pelo desenvolvedor, incluindo apresentação no celular.
- Prévia e produção usam bancos separados.
- Para retornar aos dados locais: definir a opção como false
  e realizar nova publicação.

  ## Prazos de autenticação

- Sessão expira após 2 horas sem requisições administrativas
  autenticadas ou 24 horas após o login, o que ocorrer primeiro.
- Recuperação de acesso válida por 15 minutos, com uso único.
- Logout, troca de senha e desativação podem encerrar
  o acesso antes desses prazos.

  ## Primeiro acesso

- Contas criadas por procedimento controlado, sem cadastro público.
- Cada pessoa recebe um link de uso único para definir sua senha.
- Link válido por 15 minutos; se expirar, será necessário emitir outro.
- Conta sem senha definida não pode autenticar.
- Primeiro acesso não faz login automático.
- Tokens não serão registrados em logs, Git ou documentação.

## Avaliação do hash de senhas

- PBKDF2-HMAC-SHA256 com 600 mil iterações testado no Node
  e no runtime local do Cloudflare.
- Senha correta, senha incorreta e salt individual verificados.
- Teste remoto temporário preparado como Pages Function.
- AUTH_PROBE_SECRET configurado somente no Preview.
- Referência de hash usa exclusivamente dados fictícios.
- TypeScript das Functions, lint e build passaram.
- Viabilidade e consumo de CPU remoto ainda não confirmados.
- Função auth-probe deve ser removida antes de merge na main.
- Nenhuma conta administrativa criada.

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

  ## Autenticação delegada ao Firebase

- Usuário aprovou tela com Usuário e Senha.
- Firebase Authentication escolhido para verificação de senhas.
- Mapeamento de usuário realizado no servidor.
- Sessões e autorização administrativa permanecem sob
  controle da aplicação.
- Decisão substitui armazenamento próprio de hash de senha.
- Nenhuma conta administrativa criada nesta revisão.

## Administrador de teste local

- Firebase de prévia criado no plano Spark.
- Método e-mail/senha habilitado internamente.
- Política de senha configurada com mínimo de 15 caracteres.
- Tela futura usará usuário, sem exigir e-mail no login.
- Migração 0003_administradores.sql aplicada somente localmente.
- Conta teste.eduardo associada ao UID do Firebase e conferida.
- Administrador permanece inativo.
- Cadastro privado em .private/, fora do Git e sem senha.
- Nenhuma tabela administrativa aplicada aos bancos remotos.
- Login e sessões ainda não implementados.

## Teste local de autenticação com Firebase

- Script privado de execução local, sem rota pública de login.
- Configuração carregada de .dev.vars, fora do Git.
- Credenciais corretas aceitas e UID esperado conferido.
- Uma tentativa com senha incorreta foi rejeitada.
- Senha digitada de forma oculta; tokens não impressos ou gravados.
- Nenhuma sessão administrativa criada.
- Administrador de teste permanece inativo no D1 local.
- Limitação própria de tentativas ainda não implementada.
- Produção não alterada.

## Estrutura local de sessões

- Migração 0004_sessoes_administrativas.sql aplicada localmente.
- Tabela vazia e índices conferidos.
- Datas de sessão armazenadas em segundos UTC.
- Registro fictício com 24 horas aceito.
- Tentativa de ampliar para 25 horas bloqueada por CHECK.
- Prazo original de 86400 segundos preservado.
- Registro fictício removido; consulta confirmou zero restantes.
- Nenhum token real, cookie ou sessão autenticada criado.
- Validação de inatividade, revogação e conta ativa
  ainda será implementada na API.
- Bancos remotos não alterados.

### 2026-10-27 — Tokens e verificação de sessões administrativas

- Implementada geração de tokens aleatórios de 32 bytes, em base64url.
- Implementado hash SHA-256 do token, destinado ao armazenamento no D1.
- A senha permanece sob responsabilidade do Firebase Authentication.
- Implementada verificação de sessão com consultas parametrizadas.
- Somente sessões não revogadas, dentro da validade e vinculadas a
  administradores ativos são aceitas.
- O limite de inatividade é de 2 horas. A validade absoluta máxima de
  24 horas é limitada pela estrutura da tabela.
- A atividade é atualizada na mesma operação que verifica as condições
  da sessão, sem renovar sessões inválidas.
- Configurações TypeScript adicionadas para os módulos do servidor
  e os testes de autenticação.

Validação realizada:
- Testes de formato, hash e rejeição de tokens inválidos passaram.
- Verificações de tipos passaram.
- Testes executados em banco D1 local separado, em
  .wrangler/session-tests.
- Sessão válida aceita e atividade atualizada.
- Sessões vencida, inativa e revogada recusadas.
- Sessão de administrador desativado recusada.
- Tokens inexistente e inválido recusados.
- Sessão inativa não teve sua atividade renovada.

Pendências:
- Implementar login, limitação de tentativas e cookie protegido.
- Integrar a verificação às rotas administrativas.
- Implementar logout e proteções das operações de escrita.
- Esta etapa não liberou acesso administrativo nem alterou bancos remotos.

### 2026-10-27 — Cookie de sessão administrativa

- Criadas funções para montar, ler e remover o cookie de sessão.
- Cookie __Host-atelie_admin com Path=/, HttpOnly, Secure,
  SameSite=Strict e sem Domain.
- Prazo do cookie de 24 horas, sem renovar a validade absoluta
  da sessão no banco.
- Leitura recusa tokens inválidos e cookies duplicados.
- Apagar o cookie não substitui a revogação da sessão no D1.
- Testes automatizados e verificação de tipos passaram.
- Habilitado allowImportingTsExtensions para os imports usados
  pelos testes diretos no Node, mantendo noEmit.
- Uso real no navegador e integração com login ainda pendentes.

### 2026-10-27 — Estrutura para controle de tentativas de login

- Criada a migração 0005_tentativas_login.sql.
- Estrutura separa os controles por usuário e por IP, usando chaves
  em formato hash, sem armazenar senhas.
- Preparados contador de falhas, início da janela e prazo de bloqueio.
- Regra planejada: 5 falhas em 15 minutos geram bloqueio de 15 minutos.
- Migração aplicada somente ao banco local isolado de testes.
- Testado que o banco rejeita contador negativo.
- Confirmado que a tabela permaneceu vazia após a rejeição.
- Contagem, concorrência e bloqueio ainda não implementados.
- Nenhuma alteração realizada nos bancos remotos.

### 2026-10-27 — Reservas temporárias de login

- Criada a migração 0006_reservas_login.sql.
- Reservas identificadas por escopo e chave em hash.
- Chave primária impede reservas duplicadas para o mesmo usuário ou IP.
- Validade de cada reserva limitada a, no máximo, 60 segundos.
- Migração aplicada somente ao banco local isolado de testes.
- Testada a rejeição de uma reserva duplicada.
- Registro fictício removido e tabela vazia confirmada.
- Aquisição conjunta, expiração e proteção contra concorrência
  ainda serão implementadas e testadas no módulo do servidor.
- Nenhuma alteração realizada nos bancos remotos.

### 2026-10-27 — Aquisição de reservas de login

- Implementada aquisição das reservas de usuário e IP em uma
  transação no D1, com consultas parametrizadas.
- Aquisições parciais são removidas sem alterar reservas de
  outras tentativas.
- Reservas vencidas podem ser substituídas.
- Bloqueio vigente de usuário ou IP impede a aquisição.

Validação no banco local isolado:
- Aquisição conjunta e recusa de duplicatas.
- Disputas por usuário e por IP sem reservas parciais.
- Preservação das reservas da tentativa original.
- Dez tentativas simultâneas com exatamente uma vencedora.
- Substituição de reservas vencidas.
- Recusa de usuário e IP bloqueados, preservando o bloqueio.
- Os nove testes passaram.

Pendências:
- Implementar registro de falhas e liberação segura das reservas.
- Conferir a posse e a validade da reserva ao concluir a tentativa.
- Integrar ao Firebase e ao fluxo de login.
- Nenhuma alteração realizada nos bancos remotos.

### 2026-10-27 — Registro de falhas e bloqueio de login

- Implementado registro de falhas para usuário e IP.
- Exigidas as duas reservas válidas e pertencentes à tentativa.
- Registro e liberação das reservas realizados em uma transação.
- Quinta falha em uma janela de 15 minutos gera bloqueio de 15 minutos.
- Janela vencida reinicia a contagem.
- Tentativas vencidas ou já concluídas não registram novas falhas.
- A liberação não remove reservas de uma tentativa substituta.

Validação no banco local isolado:
- Os 11 testes de contagem, bloqueio, expiração e proteção contra
  tentativas antigas passaram.
- Nenhum teste consultou o Firebase ou alterou bancos remotos.

Pendências:
- Tratar liberação sem falha e conclusão de login válido.
- Integrar ao Firebase e às rotas administrativas.
- Validar o fluxo completo antes de publicar.

### 2026-10-27 — Liberação de reservas sem registrar falha

- Implementada liberação limitada às chaves e ao identificador
  da própria reserva.
- A operação não altera contadores nem bloqueios e não concede acesso.
- Destinada a encerrar tentativas sem classificá-las como senha
  incorreta, como em falhas de comunicação com o provedor.
- Quatro testes passaram no banco local isolado:
  - Liberação preserva os contadores.
  - Repetição da liberação é segura.
  - Execução antiga não remove reservas da substituta.
  - Substituta consegue liberar suas próprias reservas.
- Integração com Firebase e login ainda pendente.
- Nenhum banco remoto foi alterado.

### 2026-10-27 — Criação de sessão administrativa

- Implementada criação da sessão e liberação das reservas em uma
  transação no D1.
- Exigidos administrador ativo, UID correspondente, duas reservas
  válidas da tentativa e ausência de bloqueios vigentes.
- Somente o hash do token é armazenado no banco.
- Sessão criada com validade absoluta de 24 horas.
- Contadores de falhas não são zerados por essa função.
- O UID deverá vir da futura confirmação confiável do Firebase,
  nunca diretamente do navegador.

Validação no banco local isolado:
- Os 11 testes passaram.
- Conferidos criação, hash, prazo e reconhecimento da sessão.
- Recusados UID incorreto, administrador desativado, reserva
  vencida ou reutilizada e bloqueios aplicados durante a tentativa.
- Dez conclusões simultâneas da mesma reserva criaram somente
  uma sessão.
- Dados fictícios removidos pelos testes.
- Firebase e cookie ainda não integrados ao login.
- Nenhum banco remoto foi alterado.

### 2026-10-27 — Comunicação com Firebase Authentication

- Implementada autenticação por email e senha exclusivamente no servidor.
- Configurado prazo de 15 segundos para a requisição.
- Separados os resultados: confirmado, recusado, limitado e indisponível.
- Falhas de rede, configuração ou serviço não são classificadas
  como credenciais incorretas.
- O módulo retorna somente o UID quando confirma a autenticação.
- Senhas e tokens não são registrados pelo módulo.

Validação:
- Oito testes simulados passaram.
- Conta de teste real autenticada com o UID esperado.
- Uma tentativa real com senha incorreta foi recusada.
- Nenhuma sessão administrativa ou cookie foi criado.
- Integração com reservas, contadores e rota de login ainda pendente.

### 2026-10-27 — Chaves de controle das tentativas de login

- Implementada normalização do usuário para minúsculas.
- Implementadas chaves HMAC-SHA-256 separadas por usuário e IP.
- Oito testes automatizados passaram.
- A verificação de formato do IP é básica; sua origem confiável
  deverá ser garantida pela futura rota no Cloudflare.
- Gerado segredo aleatório local de 32 bytes.
- AUTH_RATE_LIMIT_SECRET armazenado somente em .dev.vars,
  arquivo confirmado como ignorado pelo Git.
- O script de geração não exibe nem substitui um segredo existente.
- Alterar o segredo muda as chaves de controle de tentativas.
- Nenhuma configuração remota foi alterada.

### 2026-10-27 — Coordenação do fluxo de login

- Integradas chaves de controle, reservas, busca do administrador,
  autenticação pelo provedor, registro de falhas e criação de sessão.
- Usuário inexistente ou desativado utiliza consulta com email
  fictício de domínio reservado, sem criar conta.
- UID confirmado deve corresponder ao administrador ativo.
- Indisponibilidade e limitação do provedor não aumentam as falhas.
- O token retornado destina-se exclusivamente à criação do cookie
  pelo servidor e não deve ser enviado em JSON.

Validação:
- Os 12 testes passaram no D1 local isolado, com Firebase simulado.
- Conferidos sucesso, recusas, indisponibilidade, limitação,
  UID incorreto e desativação durante a autenticação.
- Após cinco falhas, nova tentativa não consultou o provedor.
- Cenários de recusa não criaram sessões nem deixaram reservas.
- Tempos de resposta idênticos entre contas existentes e inexistentes
  não foram garantidos.
- Rota pública, cookie no navegador e tela ainda pendentes.
- Nenhum banco remoto foi alterado.

### 2026-10-28 — Rota de login administrativo

- Criada a rota POST /api/admin/login.
- Exigidos origem autorizada, cabeçalho próprio e conteúdo JSON.
- Corpo limitado a 2048 bytes efetivamente lidos.
- Aceitos somente usuário e senha, com validação de formato e tamanho.
- IP online obtido pelo cabeçalho do Cloudflare; substituição
  explícita permitida somente no ambiente HTTP local.
- Token enviado somente no cookie protegido, sem exposição no JSON.
- Respostas de autenticação usam Cache-Control: no-store.

Validação e correções:
- Nove testes automatizados de requisição passaram.
- Recusas locais verificadas: método 405, origem 403 e JSON inválido 400.
- Corrigida incompatibilidade do Cloudflare com redirect: error.
  Adotado redirect: manual, recusando respostas de redirecionamento.
- Nove testes simulados do módulo Firebase passaram após a correção.
- Conta de teste ativada somente no banco local.
- Corrigido email de exemplo que havia permanecido no cadastro local.
- Login real pela rota passou: resposta, atributos do cookie
  e controle de cache conferidos.
- Configurações e SQL com dados privados permaneceram fora do Git.

Pendências:
- Revogar a sessão local criada pelo teste.
- Verificar cookie no navegador em HTTPS.
- Implementar acesso protegido, logout e tela administrativa.
- Nenhuma alteração realizada nos bancos remotos nesta etapa.

### 2026-10-28 — Logout administrativo

- Implementada revogação da sessão no D1 sem renovar sua atividade.
- Criada a rota POST /api/admin/logout com validação de origem
  e leitura do token exclusivamente pelo cookie.
- Logout solicita remoção do cookie e usa Cache-Control: no-store.
- Repetir o logout é permitido, inclusive sem sessão válida.
- Falha de banco não é apresentada como logout concluído.

Validação:
- Cinco testes de revogação passaram no banco isolado.
- Testadas revogação, repetição, tokens inválidos e conta desativada.
- Teste real das rotas confirmou login, resposta de logout,
  remoção do cookie e repetição.
- Corrigido o envio do cookie pelo cliente PowerShell de teste.
- Revogação da sessão confirmada por consulta ao D1 local.
- Sessões locais anteriores da conta de teste também foram revogadas.
- Nenhum banco remoto foi alterado.
- Uso pelo navegador em HTTPS ainda pendente.

### 2026-10-28 — Tela de login e área administrativa inicial

- Criada consulta GET /api/admin/session, com verificação no D1.
- Resposta autenticada contém somente nome e usuário.
- Criado serviço de comunicação do React com login, sessão e logout.
- Token administrado pelo cookie HttpOnly, sem localStorage.
- Criadas as páginas /admin/login e /admin.
- Área administrativa verifica a sessão antes de mostrar seu conteúdo.
- Adicionado botão de saída.
- Navegação pública permanece sem link administrativo.
- Tipos do servidor, lint e build passaram.
- Acesso local conferido no navegador.
- Cadastro e edição de peças ainda não implementados.
- Validação em HTTPS na prévia ainda pendente.
- Nenhuma publicação realizada nesta etapa.

### 2026-10-28 — Preparação da autenticação na prévia

- Renovada autorização do Wrangler com permissões restritas ao D1.
- Migrações administrativas 0003 a 0006 aplicadas no banco de prévia.
- Conta teste.eduardo cadastrada na prévia, inicialmente desativada.
- SQL com email interno mantido na pasta privada, fora do Git.
- Confirmado o endereço da branch:
  https://preview.atelie-anayvillin.pages.dev
- Configurados somente no ambiente Preview:
  - ADMIN_ORIGIN como texto.
  - FIREBASE_WEB_API_KEY como Secret.
  - AUTH_RATE_LIMIT_SECRET como Secret exclusivo da prévia.
- Valores secretos não registrados na documentação ou no Git.
- Configurações terão efeito na próxima publicação.
- Produção não alterada.
- Ativação da conta e teste de login em HTTPS ainda pendentes.

### 2026-10-28 — Validação da autenticação na prévia HTTPS

- Publicação da branch preview concluída com sucesso.
- Consulta sem sessão retorna autenticado: false.
- Acesso a /admin sem sessão encaminha ao login.
- Conta teste.eduardo ativada somente no banco de prévia.
- Login real com Firebase conferido no navegador.
- Sessão permanece válida após atualizar a página.
- Consulta autenticada retorna somente identificação básica,
  sem token.
- Logout conferido: consulta passa a retornar autenticado: false
  e /admin volta ao login.
- Fluxo completo confirmado pelo usuário.
- Produção permanece sem alteração.
- Cadastro e edição de peças são a próxima entrega.

### 2026-10-28 — Listagem administrativa de peças

- Criada verificação reutilizável de sessão para rotas administrativas.
- Criada GET /api/admin/produtos, com acesso restrito a administradores.
- Listagem inclui rascunhos, publicados, arquivados e peças sem foto.
- Consulta paginada em 20 itens, com parâmetros SQL vinculados.
- Criado serviço no React com validação da resposta.
- Painel mostra foto, nome, coleção, material e situação.
- Implementados carregamento, erro, nova tentativa e paginação.
- Sessão recusada encaminha a interface ao login.
- Tipos, lint e build passaram.
- Proteção sem cookie e listagem autenticada conferidas localmente.
- Nenhuma peça foi alterada.
- Publicação e conferência desta listagem na prévia ainda pendentes.

### 2026-10-28 — Cadastro administrativo de rascunhos

- Implementado POST protegido em /api/admin/produtos.
- Cadastro aceita somente nome, coleção, material e descrição.
- Status definido no servidor como rascunho.
- Coleção e material devem ser compatíveis e estar ativos.
- Identificador gerado no servidor; conflitos de slug recebem sufixo.
- Requisição de cadastro limitada a 16 KB, mantendo login em 2 KB.
- Formulário carrega opções ativas e ajusta materiais pela coleção.
- Salvamento apresenta confirmação e atualiza a listagem.
- Tipos, lint, build e testes anteriores da requisição passaram.
- Dez testes da API passaram no banco isolado.
- Conferidos acesso, origem, campos extras, combinações inválidas,
  coleção inativa, gravação, conflitos e ausência no catálogo público.
- Cadastro e persistência conferidos no navegador local.
- Testado rascunho com nome provisório Terço Pérola Azul Claro.
- Cadastro sem fotos; edição, upload e publicação ainda pendentes.
- Nenhuma alteração realizada nos bancos remotos nesta entrega.

### 2026-10-28 — Cadastro de rascunho validado na prévia

- Publicação do cadastro de rascunhos concluída na branch preview.
- Formulário e opções conferidos em HTTPS.
- Com autorização, cadastrado Terço Pérola Azul Claro na prévia,
  coleção Essência, material Pérolas, sem descrição ou foto.
- Confirmadas gravação, permanência após atualizar e ausência
  no catálogo público da prévia.
- Nome permanece provisório, sujeito à revisão antes de publicar.
- Produção não alterada.

### 2026-10-29 — Edição administrativa de rascunhos

- Criadas consulta e atualização protegidas por identificador.
- Edição permite nome, coleção, material e descrição.
- Identificador, slug, fotos e situação são preservados.
- Coleção e material precisam continuar ativos e compatíveis.
- Salvamento exige a versão carregada, enviada em If-Match.
- Versão antiga é recusada para evitar sobrescrita silenciosa.
- Formulário reutilizado para criação e edição.
- Botão Editar disponível somente nos rascunhos.
- Tipos, lint e build passaram.
- Dez testes da API passaram no banco isolado.
- Teste concorrente confirmou uma gravação e quatro recusas.
- Carregamento, salvamento e reabertura conferidos no navegador local.
- Texto provisório do teste removido ao finalizar.
- Publicados e arquivados não podem ser modificados por esta edição.
- Nenhum banco remoto foi alterado nesta etapa.
- Validação da edição na prévia ainda pendente.

### 2026-10-29 — Edição validada na prévia HTTPS

- Publicação da edição de rascunhos concluída na branch preview.
- Formulário abriu com os dados atuais da peça.
- Com autorização, alterada temporariamente a descrição do
  rascunho Terço Pérola Azul Claro.
- Salvamento e permanência após reabrir foram confirmados.
- Texto provisório removido e descrição vazia conferida.
- Peça permaneceu como rascunho.
- Administração acessada pelo endereço autorizado da branch preview.
- Produção não alterada.  

### 2026-10-29 — Upload de fotos pelo painel administrativo

- Upload permitido somente para administradores autenticados
  e produtos em rascunho.
- O servidor valida o arquivo antes de enviá-lo ao Cloudinary.
- Formatos aceitos: JPEG, PNG e WebP, com limite de 5 MiB.
- Texto alternativo obrigatório.
- Upload assinado no servidor; segredo não enviado ao navegador.
- Fotos recebem identificadores únicos, sem sobrescrever arquivos.
- Novas fotos são acrescentadas à galeria, preservando a capa.
- Migração 0007 aplicada nos ambientes locais de desenvolvimento
  e testes. Aplicação na prévia remota ainda pendente.
- Testes de acesso, validação, concorrência e associação passaram.
- Upload de uma fotografia real e sua permanência após reabrir
  a galeria foram conferidos no painel local.
- Fotos originais preservadas.
- Publicação na prévia e organização das fotos serão feitas
  nas próximas etapas. Produção não alterada.

  ### 2026-10-29 — Publicação e arquivamento pelo painel

- Adicionada revisão antes de publicar, arquivar ou voltar a rascunho.
- Publicação exige nome, descrição, foto e coleção/material compatíveis
  e ativos.
- Ações exigem sessão administrativa válida e origem autorizada.
- Versões antigas são recusadas para evitar sobrescrever alterações.
- Arquivamento e retorno a rascunho preservam dados, endereço e fotos.
- Testes no banco isolado passaram, incluindo acessos indevidos,
  dados incompletos e confirmações simultâneas.
- Ciclo completo conferido no painel e catálogo locais.
- Terço Pérola Azul Claro permaneceu como rascunho ao final.
- Nenhuma peça ou configuração remota alterada nesta etapa.

### 2026-10-29 — Publicação e arquivamento validados na prévia

- Revisão e confirmação conferidas em HTTPS.
- Terço Pérola Azul Claro publicado temporariamente na prévia.
- Presença no catálogo e página individual conferidas.
- Arquivamento retirou a peça do catálogo.
- Retorno a rascunho preservou descrição e foto e liberou a edição.
- Peça mantida como rascunho ao final do teste.
- Produção não alterada.

### 2026-10-29 — Banco de produção preparado para o painel

- Backup SQL exportado para a pasta .private, ignorada pelo Git.
- Arquivo de backup conferido como existente e não vazio.
- Restauração do backup ainda não testada.
- Migrações 0003 a 0007 aplicadas em produção.
- Confirmadas 5 peças publicadas após as migrações.
- Catálogo oficial conferido após a aplicação.
- Administradores e autenticação de produção ainda não configurados.

### 2026-10-29 — Configuração administrativa de produção

- Criado projeto Firebase separado para produção.
- Habilitado login por e-mail e senha, com política de 15 a 128 caracteres.
- Conta de Eduardo vinculada ao D1 e ativada com autorização.
- Senha mantida exclusivamente no Firebase.
- Configurados ADMIN_ORIGIN, FIREBASE_WEB_API_KEY e
  AUTH_RATE_LIMIT_SECRET no Cloudflare Production.
- Criado preset assinado atelie_produtos_production.
- Configurada pasta atelie-anayvillin-production/produtos.
- Configurações do Cloudinary cadastradas em Production.
- SQL administrativo e segredo gerado mantidos em .private,
  fora do Git.
- Login e upload no painel oficial ainda aguardam publicação e teste.

### 2026-10-29 — Painel administrativo validado em produção

- Login, permanência da sessão após atualizar e saída conferidos.
- Cinco peças publicadas preservadas no catálogo oficial.
- Terço Pérola Azul Claro cadastrado como rascunho em produção.
- Upload da foto real concluído e permanência conferida.
- Painel com seis peças; catálogo público com cinco.
- Nova peça mantida como rascunho.
- Publicação, arquivamento e retorno a rascunho previamente
  validados no ambiente de prévia.

  ### 2026-10-29 — Contato pelo WhatsApp na página da peça

- Adicionado botão “Encomendar pelo WhatsApp”, com ícone e sem seta.
- Mensagem inclui nome, coleção e link da peça.
- Mensagem preenchida para revisão, sem envio automático.
- Número configurado por VITE_WHATSAPP_NUMBER.
- Número ausente ou com formato inválido oculta o botão.
- Número de teste mantido no arquivo local, fora do Git.
- Destino e mensagem conferidos localmente com o número de Eduardo.
- Lint e build concluídos sem erros.
- Publicação na prévia com o número de teste ainda pendente.
- Número da cliente será configurado somente após os testes
  e com autorização.

  ### 2026-10-29 — WhatsApp validado na prévia

- Botão conferido em HTTPS com o número de teste de Eduardo.
- Destino, nome da peça, coleção, acentos e link conferidos.
- Mensagem preenchida sem envio automático.
- Número configurado somente no ambiente Preview.
- Produção e contato da cliente não alterados.

### 2026-10-29 — Acervo da coleção Essência cadastrado

- Coleção Essência com seis peças em produção.
- Terço Pérola Azul permanece publicado.
- Azul Claro, Branca com Rosas, Preta, Verde Claro e Verde Escuro
  mantidos como rascunho.
- Novos cadastros com descrição, foto real e texto alternativo.
- Dados e fotos conferidos após atualizar a página.
- Publicação dos rascunhos aguarda revisão.

### 2026-10-29 — Acervo da coleção Promessa cadastrado

- Coleção Promessa com seis peças em produção.
- Terço Pérola Branca permanece publicado.
- Azul, Lilás, Marrom, Preta e Rosa Claro mantidos como rascunho.
- Novos cadastros com descrição, foto real e texto alternativo.
- Dados e fotos conferidos após atualizar a página.
- Publicação dos rascunhos aguarda revisão.

### 2026-10-29 — Acervo da coleção Luz cadastrado

- Coleção Luz com sete peças em produção.
- Terço Cristal Azul Royal permanece publicado.
- Seis novas peças mantidas como rascunho, com descrição,
  foto real e texto alternativo.
- “Tons de Azul”, “Tons de Rosa” e “Tons de Vermelho”
  identificam variações de cores, mantendo o material Cristais.
- Dados e fotos conferidos após atualizar a página.
- Publicação dos rascunhos aguarda revisão.

### 2026-10-29 — Acervo da coleção Graça cadastrado

- Coleção Graça com nove peças em produção.
- Terço Cristal Rosa Claro permanece publicado.
- Oito novas peças mantidas como rascunho, com descrição,
  foto real e texto alternativo.
- Dados e fotos conferidos após atualizar a página.
- Publicação dos rascunhos aguarda revisão.

### 2026-10-29 — Conferência do acervo disponível

- Acervo de produção com 29 peças: 5 publicadas e 24 rascunhos.
- Essência: 6; Promessa: 6; Luz: 7; Graça: 9; Raízes: 1.
- Raízes mantém somente o Terço Madeira Marrom já publicado.
- Nenhum cadastro duplicado necessário para Raízes.
- Infantil permanece adiado.
- Novas peças aguardam revisão antes da publicação.

### 2026-10-29 — Publicação do acervo revisado

- Publicados os 24 rascunhos após revisão e autorização.
- Catálogo oficial com 29 peças publicadas:
  Essência 6, Promessa 6, Luz 7, Graça 9 e Raízes 1.
- Contagens por coleção e total conferidas no catálogo.
- Páginas individuais de novas peças conferidas.
- Infantil permanece adiado.

### 2026-10-29 — Refinamentos de interface e rodapé

- Fechamento do filtro com animação de saída e fundo suave.
- Troca dos cards de coleções com deslocamento e transparência.
- Animações respeitam a preferência de reduzir movimentos.
- Botão da peça alterado para “Solicitar Encomenda”.
- Rodapé com Instagram @atelie_anayvillin e contato pelo WhatsApp.
- WhatsApp do rodapé utiliza mensagem geral sobre encomendas.
- Visual e destinos dos links conferidos localmente, sem envio
  de mensagens.
- Lint e build concluídos sem erros.
- Contato definitivo da cliente ainda pendente.

### 2026-10-29 — Refinamentos conferidos na prévia

- Transições das coleções e fechamento do filtro conferidos em HTTPS.
- Rodapé e destinos dos links conferidos.
- Nenhum problema relatado na conferência da prévia.
- Produção ainda não atualizada com estes refinamentos.

### 2026-10-29 — Refinamentos validados em produção

- Transições das coleções e fechamento do filtro conferidos.
- Novo rodapé e link do Instagram conferidos.
- Catálogo preservado com 29 peças.
- WhatsApp permanece oculto em produção, aguardando
  configuração autorizada do contato definitivo.
  - Conforme alinhamento com a cliente, Eduardo ficará responsável
  pela administração e atualização do catálogo.
- Conta administrativa da cliente adiada.

### 2026-10-29 — Apresentação e acabamento da Home

- Acrescentada apresentação dos terços sob encomenda e da personalização.
- Botão inicial “Conheça as coleções” direciona à seção correspondente.
- Ajustados os espaçamentos da primeira seção.
- Adicionada divisão curva na entrada das coleções.
- Ornamento floral entre história e personalização.
- Entradas suaves ao rolar, somente na Home e uma vez por abertura.
- Efeitos respeitam a preferência de reduzir movimentos.
- Intensidade ajustada após avaliação visual local.
- Lint e build concluídos sem erros.
- Alterações ainda não publicadas na prévia.
- Ajustes da Home conferidos e aprovados na prévia em HTTPS.

### Pendência para a revisão final

- Alterar o destino do botão inicial “Conheça as coleções”
  para /catalogo, em vez da seção interna da Home.
- Implementado em 2026-10-30: botão “Conheça as coleções”
  direciona para /catalogo usando React Router.
- Navegação conferida localmente; lint e build sem erros.
- Validação na prévia ainda pendente.