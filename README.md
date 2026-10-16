# Site Steelbox Academia

Prévia do site da Steelbox Academia (Ponta Grossa/PR) — unidades Neves e Borato. Feito pela M3P Store.

Site estático (HTML + CSS + JS), sem build. Publicado na Vercel.

## Estrutura
- `index.html` — página única
- `css/site.css` — visual nas cores da marca (marinho, grafite e o azul da fachada), fonte Archivo expandida
- `js/site.js` — rolagem suave (Lenis), animações e 3D em CSS (GSAP), avaliações e interações
- `vendor/` — bibliotecas hospedadas no próprio site (sem depender de CDN)
- `assets/` — logo oficial da Steelbox vetorizada a partir da arte do Google Meu Negócio:
  `logo.svg` (cores originais), `logo-escuro.svg` (para fundo escuro), `logo-branca.svg`, `simbolo.svg`, `simbolo-branco.svg`
- `fotos/` — fotos do Instagram e do Google Meu Negócio, no formato original (sem cortes)

## Antes de lançar oficialmente
A prévia está **sem indexação no Google**. Quando o cliente aprovar:
1. Remover `<meta name="robots" content="noindex, nofollow">` do `index.html`
2. Remover o header `X-Robots-Tag` do `vercel.json`
3. Trocar o `robots.txt` por `Allow: /`
4. Apontar o domínio `steelboxacademia.com.br` para a Vercel
