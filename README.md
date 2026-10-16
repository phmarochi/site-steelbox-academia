# Site Steelbox Academia

Prévia do site da Steelbox Academia (Ponta Grossa/PR) — unidades Neves e Borato. Feito pela M3P Store.

Site estático (HTML + CSS + JS), sem build. Publicado na Vercel.

## Estrutura
- `index.html` — página única
- `styles.css`, `script.js`
- `assets/logo.svg` — logo "SB" redesenhado em vetor
- `fotos/` — fotos do Instagram e do Google Meu Negócio da academia

## Antes de lançar oficialmente
A prévia está **sem indexação no Google**. Quando o cliente aprovar:
1. Remover `<meta name="robots" content="noindex, nofollow">` do `index.html`
2. Remover o header `X-Robots-Tag` do `vercel.json`
3. Trocar o `robots.txt` por `Allow: /`
4. Apontar o domínio `steelboxacademia.com.br` para a Vercel
