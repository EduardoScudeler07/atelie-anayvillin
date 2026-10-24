# Banco de dados — planejamento V1

## Objetivo

Substituir os dados locais do catálogo por dados persistentes
no Cloudflare D1, acessados por uma API.

O navegador não acessará o banco diretamente.
A API validará as operações e retornará somente dados públicos
nas rotas do catálogo.

## Divisão de responsabilidades

- D1: produtos, coleções, materiais e referências das imagens.
- Cloudinary: arquivos de mídia, após configuração própria.
- React: apresentação e interação.
- API: consultas, validação e autorização administrativa.

## Ambientes propostos

- Local: desenvolvimento no computador.
- Prévia: banco remoto separado para testes.
- Produção: banco remoto com os dados oficiais.

Prévia e produção não devem compartilhar o mesmo banco.

## Modelo aprovado

### colecoes

Campos previstos:

- id
- nome
- slug único
- descricao
- ordem
- ativo

Coleções: Essência, Promessa, Luz, Graça, Raízes e Infantil.

Infantil permanece prevista, embora ainda não apareça
no carrossel da Home.

### materiais

Campos previstos:

- id
- nome
- slug único
- ativo

Materiais: Pérolas, Cristais e Madeira.

Raízes é uma coleção; Madeira é um material.

### produtos

Campos previstos:

- id
- colecao_id
- material_id
- nome
- slug único
- descricao
- status
- criado_em
- atualizado_em

Cada produto pertence a uma coleção e possui um material.
Peças com vários materiais não fazem parte da modelagem V1.

Status permitidos:

- rascunho
- publicado
- arquivado

Despublicar retorna o produto para rascunho.
Arquivar preserva o registro sem exibi-lo publicamente.

### produto_imagens

Campos previstos:

- id
- produto_id
- cloudinary_public_id
- url
- texto_alternativo
- ordem

Um produto pode ter várias imagens.
A primeira na ordem da galeria será a capa.

A transição das imagens locais para Cloudinary será definida
antes da implementação das migrações e da importação dos dados.

## Relacionamentos

- Uma coleção pode ter vários produtos.
- Um material pode estar associado a vários produtos.
- Um produto pode ter várias imagens.

## Regras aprovadas

- Produto deve ter nome, slug, coleção e material válidos.
- Slugs de produtos não podem se repetir.
- Publicação exige descrição e pelo menos uma foto.
- Rascunhos podem ficar sem descrição e fotos.
- API pública retorna somente produtos publicados.
- Coleções e materiais associados a produtos não podem
  ser excluídos sem resolver essas associações.
- Fotos precisam de texto alternativo e ordem de exibição.

As regras serão distribuídas entre restrições do banco
e validações da API, conforme sua responsabilidade.

## Descrições

Cada produto terá descrição própria e editável.

O padrão será afetivo e acolhedor, com informações reais
sobre material, cor e características confirmadas.

Alterar o nome não reescreverá a descrição automaticamente.
Não presumir detalhes de medalhas, acabamento ou personalização.

## Fora do escopo

Não criar campos ou tabelas de:

- preços
- estoque
- carrinho
- pagamentos
- frete
- pedidos

Contas administrativas e sessões serão modeladas
na etapa de autenticação.

## Plano gratuito verificado em 24/10/2026

D1 no Workers Free:

- 5 milhões de linhas lidas por dia.
- 100 mil linhas gravadas por dia.
- 500 MB por banco.
- 5 GB de armazenamento total por conta.
- 10 bancos por conta.
- 7 dias de recuperação pelo Time Travel.

As cotas são compartilhadas pelos bancos da conta.
Linhas lidas não equivalem a visitas.

Ao atingir as cotas diárias de leitura ou escrita,
as consultas podem falhar até a renovação da cota.
Não foi autorizado ativar plano pago.

Os limites da API e as condições dos demais serviços
serão verificados nas etapas correspondentes.

Fontes:

- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/platform/limits/

## Pendências antes da implementação

- Definir tipos SQL, IDs, índices e restrições.
- Definir atualização das datas.
- Definir ordenação única das fotos por produto.
- Planejar migrações e dados iniciais.
- Definir a transição das imagens locais.
- Configurar e verificar os ambientes separadamente.
- Planejar exportação e testar recuperação.
- Conferir condições aplicáveis ao uso comercial
  antes de criar os recursos.