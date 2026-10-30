# Operação do Ateliê Anayvillin

Responsável pela atualização do catálogo: Eduardo.
Conta administrativa da cliente adiada conforme alinhamento.

## Acessar o painel

Produção:
https://atelie-anayvillin.pages.dev/admin

Prévia:
https://preview.atelie-anayvillin.pages.dev/admin

Use o endereço fixo do ambiente, sem prefixo de publicação.
As contas e os bancos de prévia e produção são separados.

Não compartilhar senhas. Não deixar o painel conectado em
computadores de terceiros. Use “Sair” ao encerrar nesses dispositivos.

## Adicionar uma peça

1. Separar a foto real correspondente.
2. Conferir nome, coleção, material e descrição.
3. Cadastrar como rascunho no painel oficial.
4. Em “Fotos”, enviar a imagem com texto alternativo.
5. Atualizar a página e conferir se os dados permaneceram.
6. Abrir a revisão e confirmar a publicação.
7. Conferir a peça no catálogo público e na página individual.

Não criar outro cadastro se a resposta de uma operação for incerta.
Primeiro atualize a lista e confira se ela foi concluída.

## Fotos

- Formatos: PNG, JPEG e WebP.
- Limite: 5 MiB por arquivo.
- Manter a peça inteira, bem enquadrada e com fundo padronizado.
- Conferir se a foto é da coleção e da variação corretas.
- Descrever cor, material e detalhes relevantes no texto alternativo.
- Preservar os arquivos originais e as versões editadas.

A primeira imagem cadastrada é a capa.
Não há exclusão ou reordenação de fotos pelo painel nesta versão.

A imagem da seção de personalização da Home e as imagens das coleções
são referências fixas no código; não mudam ao cadastrar produtos.

## Corrigir ou retirar uma peça

Para corrigir:
1. Voltar a peça a rascunho.
2. Editar e salvar.
3. Conferir a revisão.
4. Publicar novamente.

Para retirar do catálogo:
1. Arquivar.
2. Conferir que a peça não aparece no catálogo.

Dados e fotos permanecem guardados.
Voltar a rascunho não publica automaticamente.

## Alterar o contato do WhatsApp

No Cloudflare, abrir o projeto Pages e selecionar o ambiente correto.

Alterar VITE_WHATSAPP_NUMBER usando somente:
código do país + DDD sem zero inicial + número.

A configuração é pública no destino do link.
Não usar uma variável VITE_ para guardar segredos.

A mudança exige nova compilação/publicação do ambiente.
Depois conferir:
- destino do botão da peça;
- nome, coleção e link na mensagem;
- destino e mensagem geral do rodapé.

Não é necessário enviar a mensagem para conferir esses pontos.

## Publicar alterações no código

Dados do painel são gravados diretamente no banco do ambiente.
Eles não precisam de commit ou deploy para aparecer após a publicação da peça.

Mudanças de código seguem outro fluxo:
1. Trabalhar na branch preview.
2. Executar lint, build e verificações pertinentes.
3. Conferir a prévia em HTTPS.
4. Revisar o pull request para main.
5. Aprovar o merge e conferir o site oficial.

Não utilizar produção para testes automatizados de escrita.

## Cópias de segurança

Manter cópias privadas de:
- exportação SQL do D1;
- fotos originais e editadas;
- identidade visual;
- configurações necessárias para recuperação, em armazenamento seguro.

Guardar uma cópia adicional em local privado separado do computador.
Não colocar backups ou segredos no repositório público.

Gerar backup antes de:
- migrações de produção;
- mudanças importantes no acervo;
- procedimentos de recuperação.

Usar nomes com data e hora, sem sobrescrever a cópia anterior.

A exportação SQL contém dados administrativos.
O arquivo não contém as fotos, apenas suas referências.

A restauração foi testada em banco local isolado em 2026-10-30.
O procedimento de recuperação em produção exige avaliação e
autorização próprias; não executar uma importação por tentativa.

## Verificar um backup restaurado

Usar banco local separado, configuração própria e --local.

Conferir:
- PRAGMA quick_check: ok;
- PRAGMA foreign_key_check: nenhuma ocorrência;
- quantidade e situação dos produtos;
- quantidade de imagens e produtos sem foto;
- contagem por coleção.

No teste de 2026-10-30:
29 produtos publicados e 29 imagens.
Essência 6, Promessa 6, Luz 7, Graça 9 e Raízes 1.

## Se houver problema

### Login não funciona

- Conferir o endereço fixo do painel.
- Conferir se a conta pertence ao ambiente correto.
- Usar a senha criada no Firebase, não a senha do e-mail pessoal.
- Respeitar o bloqueio temporário após falhas.
- Se necessário, redefinir a senha pelo Firebase, sem alterar o banco
  para guardar uma senha manualmente.

### Upload apresentou erro

- Conferir formato e tamanho.
- Atualizar a galeria antes de repetir.
- Conferir os logs e o registro do envio quando necessário.
- Não excluir imagens no Cloudinary sem verificar onde são utilizadas.

### Peça não aparece

- Conferir se está publicada.
- Conferir coleção/material ativos e filtros selecionados.
- Conferir se o painel e o catálogo pertencem ao mesmo ambiente.

### API ou serviço indisponível

- Verificar os logs do Cloudflare sem expor dados privados.
- Conferir vínculos e variáveis do ambiente.
- Conferir os limites e o estado do provedor.
- Não ativar plano pago ou trocar permissões por tentativa.

## Acompanhamento

Após alterações importantes, conferir computador e celular:
Home, catálogo, filtros, página da peça, contatos e login.

Monitorar armazenamento, tráfego e demais limites nos painéis
do Cloudflare, Cloudinary e Firebase.

Revisar atualizações de dependências em uma etapa própria,
sempre com testes na prévia antes de produção.