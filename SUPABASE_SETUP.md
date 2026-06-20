# Nexora + Supabase

O frontend ja esta configurado com:

- Project URL: `https://gtoxexdhqhhwcplnfohh.supabase.co`
- Publishable key: configurada em `app.js`
- Tabela usada agora: `nexora_products`

## Como ativar

1. Abra o Supabase Dashboard.
2. Entre no projeto `gtoxexdhqhhwcplnfohh`.
3. Va em `SQL Editor`.
4. Cole e execute o conteudo de `supabase-schema.sql`.
5. Abra o Nexora.
6. Faca login.
7. Abra `Admin demo` ou a `Central de ações`.
8. Clique em `Supabase`.

Se aparecer `Conectado`, os produtos cadastrados/importados passam a sincronizar com Supabase.

## O que ja sincroniza

- Produtos cadastrados manualmente.
- Produtos importados por texto autorizado.
- Remocao de produtos.
- Origem, link de origem, preco, estoque, status e resumo de midias.

## Limite atual

As fotos/videos ainda ficam na demo local. O Supabase recebe apenas resumo e quantidade de midias. Para producao real, o proximo passo e enviar os arquivos para Supabase Storage e gravar as URLs em `nexora_product_media`.

## Aviso de seguranca

O schema atual usa policies abertas para a demo funcionar com publishable key. Antes de vender como producao, troque as policies por regras com login real, `auth.uid()` e membros por empresa.
