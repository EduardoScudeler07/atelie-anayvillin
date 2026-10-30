# Banco de dados — V1

## Responsabilidades

- Cloudflare D1: produtos, coleções, materiais, referências de imagens
  e controle administrativo.
- Cloudinary: arquivos das fotografias enviadas pelo painel.
- Firebase Authentication: autenticação por senha.
- Pages Functions: acesso aos dados, validação e autorização.
- React: apresentação e interação.

O navegador não acessa diretamente o D1.

## Ambientes

| Ambiente | Banco | Configuração |
|---|---|---|
| Local | atelie-anayvillin-local | wrangler.local.jsonc |
| Prévia | atelie-anayvillin-preview | wrangler.preview.jsonc |
| Produção | atelie-anayvillin-production | wrangler.production.jsonc |

O vínculo utilizado pelas Functions é DB.

Os bancos são separados. Commit, push ou merge não copiam dados
entre ambientes nem aplicam automaticamente migrações.

O ambiente local das Pages Functions utiliza DB=DB e a persistência
em .wrangler/state, conforme as instruções do README.

## Tabelas do catálogo

### colecoes

- id: identificador interno.
- nome: nome exibido.
- slug: identificador único para URLs e filtros.
- descricao: apresentação da coleção.
- ordem: ordem de exibição.
- ativo: disponibilidade da coleção.

Coleções cadastradas:
Essência, Promessa, Luz, Graça, Raízes e Infantil.

Infantil permanece desativada e adiada.

### materiais

- id
- nome
- slug único
- ativo

Materiais: Pérolas, Cristais e Madeira.

### produtos

- id: identificador interno.
- colecao_id: referência à coleção.
- material_id: referência ao material.
- nome
- slug único
- descricao
- status
- criado_em
- atualizado_em

Cada produto possui uma coleção e um material.

Situações:
- rascunho: fora do catálogo e disponível para edição.
- publicado: disponível no catálogo quando as demais condições
  públicas estiverem atendidas.
- arquivado: fora do catálogo, preservando os dados.

Os nomes podem se repetir; os slugs não.
O nome não altera automaticamente a descrição.
A edição preserva o slug da peça.

Datas dos produtos utilizam texto em formato ISO UTC.

### produto_imagens

- id
- produto_id
- cloudinary_public_id
- url
- texto_alternativo
- ordem

A combinação produto_id e ordem é única.

A foto com menor ordem é utilizada como capa.
O modelo aceita várias imagens, mas o acervo atual possui uma por peça.

Não há exclusão ou reordenação de imagens pelo painel nesta versão.

## Compatibilidade entre coleção e material

- Essência e Promessa: Pérolas.
- Luz e Graça: Cristais.
- Raízes: Madeira.

A compatibilidade é validada no servidor.
Ativar Infantil no banco não substitui a revisão das regras e da interface
necessárias para disponibilizar essa coleção futuramente.

## Publicação e consultas públicas

Rascunhos podem ficar sem descrição e foto.

A publicação pelo painel exige:
- nome e descrição válidos;
- pelo menos uma foto com texto alternativo;
- coleção e material ativos e compatíveis;
- administrador ativo e sessão autorizada;
- versão atual da peça.

A restrição do banco exige descrição não vazia para status publicado.
As demais regras de publicação são verificadas pela API.

A listagem pública retorna produtos publicados, com coleção e material
ativos e imagem de capa cadastrada.

Arquivar ou voltar a rascunho retira a peça do catálogo.
Essas ações preservam endereço, descrição e fotos.

Consultas SQL utilizam parâmetros para os valores recebidos.
Operações de edição e situação verificam atualizado_em para impedir
que uma confirmação antiga sobrescreva uma alteração mais recente.

## Tabelas administrativas

### administradores

Contém nome, usuário, e-mail interno do Firebase, UID, situação ativa
e datas de cadastro e atualização.

Não contém senha nem hash de senha.
Usuário, e-mail e UID possuem restrições de unicidade.

### sessoes_administrativas

Contém o hash do token aleatório, referência ao administrador,
criação, última atividade, expiração e revogação.

Os tempos de sessão utilizam segundos Unix.
O token original não é armazenado no banco.

### tentativas_login

Contém escopo, chave derivada, quantidade de falhas, início da janela,
prazo de bloqueio e atualização.

A chave composta distingue os controles de usuário e IP.
As chaves são derivadas com HMAC, utilizando segredo do ambiente.

### reservas_login

Contém reservas temporárias por usuário e IP para controlar concorrência.

As reservas possuem prazo limitado e identificação própria da tentativa,
para impedir que uma execução antiga remova ou conclua outra tentativa.

### envios_imagens

Registra produto, administrador, identificador do Cloudinary,
texto alternativo, situação, código de falha e datas.

Situações:
- pendente
- concluido
- falhou

O registro permite acompanhar o resultado do envio e da associação.
Não contém o arquivo binário da fotografia.

A integração entre Cloudinary e D1 não é uma única transação.
Uma falha após o envio pode deixar um arquivo no Cloudinary sem
associação concluída. Conferir o registro e a galeria antes de repetir.

Não há exclusão automática desses arquivos nesta entrega.

## Migrações

- 0001_catalogo.sql: estrutura do catálogo.
- 0002_colecoes_materiais.sql: coleções e materiais iniciais.
- 0003_administradores.sql: administradores.
- 0004_sessoes_administrativas.sql: sessões.
- 0005_tentativas_login.sql: controle de falhas.
- 0006_reservas_login.sql: reservas.
- 0007_envios_imagens.sql: acompanhamento dos uploads.

Essas migrações foram aplicadas nos ambientes de desenvolvimento,
prévia e produção durante a implementação.

Novas migrações devem ser testadas localmente e na prévia,
com backup e autorização antes da aplicação em produção.

Os arquivos em seeds correspondem aos cinco produtos iniciais.
Não devem ser executados novamente por rotina ou para sincronizar
o acervo entre ambientes.

## Exclusões e preservação

As relações usam chaves estrangeiras e restrições para proteger
registros associados.

A V1 utiliza arquivamento no lugar da exclusão de peças pelo painel.
Não excluir diretamente fotos, coleções ou materiais sem verificar
as referências e o impacto.

Não guardar preços, pagamentos, estoque, carrinho ou pedidos neste banco.

## Acervo conferido

Na conferência de 2026-10-30:
- Essência: 6.
- Promessa: 6.
- Luz: 7.
- Graça: 9.
- Raízes: 1.

Total: 29 produtos publicados e 29 referências de imagens.

Essa contagem é um registro da entrega, não um limite do sistema.

## Backup e restauração

O backup SQL inclui estrutura e dados administrativos.
Guardar em local privado, fora do repositório público.

O backup de 2026-10-30 foi restaurado em banco local isolado:
- quick_check retornou ok;
- foreign_key_check não retornou violações;
- 29 produtos publicados;
- 29 referências de imagens;
- nenhum produto sem foto;
- contagens por coleção correspondentes.

A restauração testada não alterou produção.

O SQL não contém os arquivos das fotos. Preservar também o acervo
original e editado e as configurações necessárias à recuperação.

Não conectar o banco restaurado com dados de produção a um servidor
de testes público ou compartilhá-lo como exemplo do projeto.

## Limites e manutenção

Monitorar consumo e capacidade no painel do Cloudflare.
As cotas da conta também podem ser utilizadas por outros projetos.

Consultar as condições atuais antes de mudanças de infraestrutura.
Não ativar faturamento ou plano pago sem autorização.

Referências:
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/d1/best-practices/import-export-data/