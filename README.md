# WINX CITY — HTML, CSS e JavaScript puros

Esta é a cópia estática aprovada do portal existente, com 9 páginas, busca local, menu mobile, índice, cópia de links, logo, PDFs e os últimos negritos solicitados. Não exige React, Vite, Bun, banco de dados, login ou build. O portal gerenciado original não foi substituído.

## Publicar gratuitamente no GitHub Pages

1. Extraia este ZIP no computador. **Não envie apenas o ZIP para o repositório.** Envie os arquivos e pastas que estão dentro dele.
2. No GitHub, crie um repositório público, por exemplo `winx-city`. Os protocolos e PDFs ficarão públicos.
3. Adicione todos os arquivos na raiz do repositório, preservando as pastas `images/` e `documents/`. O `index.html` precisa estar na raiz, não dentro de uma pasta extra. Inclua o arquivo oculto `.nojekyll`.
4. Abra **Settings → Pages** do repositório.
5. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
6. Em **Branch**, selecione `main` e `/(root)`, depois **Save**.
7. Quando a publicação do GitHub terminar, abra a URL indicada em Pages, normalmente `https://SEU-USUARIO.github.io/winx-city/`.

Não é necessário contratar um backend ou usar GitHub Actions personalizado para estes arquivos. A disponibilidade de Pages em repositórios privados depende do plano do GitHub; use um repositório público para o fluxo gratuito descrito.

Documentação oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Arquivos principais

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Página inicial |
| `missao-e-valores.html` | Missão e valores |
| `in-game.html` | Protocolos in-game |
| `suporte.html` | Suporte |
| `tickets.html` | Tickets |
| `finalizacao.html` | Finalização |
| `denuncia-staff.html` | Denúncias contra Staff |
| `unban.html` | Unban |
| `gestao.html` | Gestão e desenvolvimento |
| `styles.css` | CSS reutilizado do portal, pronto para navegador |
| `app.js` | Busca e interações em JavaScript puro |
| `site-pages.js` | Lista de arquivos indexados pela busca |
| `templates.json` | HTML local das janelas de pesquisa e PDF |
| `images/` | Imagens e logo original |
| `documents/` | PDF oficial e PDF anterior de referência |
| `runable.js` | Script de analytics já existente; não é necessário para leitura ou busca |
| `.nojekyll` | Impede processamento Jekyll desnecessário |

## Editar os protocolos

Abra o HTML da seção e procure `<div class="markdown">`. Edite o texto dentro desse bloco, preservando as tags.

- Parágrafo: `<p>Texto do protocolo.</p>`
- Negrito: `<strong>Trecho em negrito:</strong>`
- Lista: `<ul><li>Regra.</li><li>Outra regra.</li></ul>`
- Subtítulo: `<h2 id="id-unico">Título</h2>`. Use um `id` único para âncoras.

Faça commit das alterações. A busca lê o conteúdo real dos arquivos HTML publicados; após publicar, recarregue a página para buscar os textos atualizados. Não é necessário reconstruir um índice ou compilar.

Se modificar o título de uma seção, atualize também os rótulos de navegação nos HTMLs e a lista `site-pages.js`. Se criar/remover/renomear páginas, ajuste `site-pages.js`, os links da navegação e os links anterior/próximo. São páginas HTML independentes, sem um gerador de templates compartilhados.

## Testar no computador

É possível abrir o HTML diretamente para ler, mas **busca e janelas usam arquivos locais via `fetch` e precisam de HTTP/HTTPS**. Para testar tudo, se Python estiver instalado, abra um terminal nesta pasta e execute:

```sh
python -m http.server 8000
```

Depois acesse `http://localhost:8000/`. No Linux/macOS, o comando pode ser `python3 -m http.server 8000`.

## Limitações desta cópia

- Não há login, painel administrativo, salvamento em banco, histórico online ou upload pelo navegador. Isso foi removido desta cópia com sua aprovação.
- O autor, as datas e os metadados são textos estáticos editáveis no HTML.
- Leitura e navegação funcionam sem JavaScript. Busca, menu mobile e janelas precisam do JavaScript habilitado.
- Todos os caminhos internos são relativos, inclusive os PDFs. Acesso direto e recarregamento foram testados na raiz e em uma pasta `/winx-city/`.
- O site não foi publicado na sua conta GitHub. Os testes foram locais, simulando a estrutura do GitHub Pages.
- Nenhuma senha, token ou chave de serviço está incluída. Não coloque credenciais no HTML ou JavaScript público.

## Website ou apresentação?

Para publicar, copiar comandos e consultar instruções enquanto configura o GitHub, **um website/guia é melhor**. Uma apresentação pode complementar um treinamento ao vivo, mas não substitui o guia operacional nem o portal de protocolos.