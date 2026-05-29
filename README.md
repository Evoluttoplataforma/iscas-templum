# Templum · Iscas (Cloudflare Pages)

Migração das landing pages de iscas do RD Station para Cloudflare Pages, para que as URLs `consultoria.templum.com.br/<slug>` continuem respondendo (sem 404) depois do cancelamento do RD.

Cada página captura nome / email / telefone / empresa, registra o contato no Mailchimp da Templum e libera o link da isca.

## Estrutura

```
.
├── public/                            # tudo aqui vira o site no Cloudflare Pages
│   ├── _redirects                     # redirects diretos (páginas sem landing)
│   ├── _headers                       # cache + headers de segurança
│   ├── assets/
│   │   ├── css/templum.css            # design system extraído (compartilhado)
│   │   └── js/form.js                 # handler do form
│   ├── <slug>/index.html              # uma pasta por página
│   └── ...
├── functions/
│   └── api/subscribe.js               # Pages Function → Mailchimp
├── data/
│   └── iscas.json                     # mapping slug → URL da isca (bundle do Function)
├── wrangler.toml                      # config Cloudflare
└── package.json                       # só pra dev local (wrangler)
```

## Variáveis de ambiente (Cloudflare Pages → Settings → Environment variables)

| Nome                       | Descrição                                                          | Exemplo            |
| -------------------------- | ------------------------------------------------------------------ | ------------------ |
| `MAILCHIMP_API_KEY`        | API key da conta Mailchimp da Templum                              | `abc...-us6`       |
| `MAILCHIMP_AUDIENCE_ID`    | ID da audiência (lista) onde os leads vão entrar                   | `a1b2c3d4e5`       |
| `MAILCHIMP_SERVER_PREFIX`  | Sufixo após o `-` na API key (ex: `us6`, `us12`)                   | `us6`              |

**Onde achar:**
- API key: Mailchimp → Account & billing → Extras → API keys
- Audience ID: Mailchimp → Audience → Settings → Audience name and defaults → campo "Audience ID"
- Server prefix: o que vem depois do `-` na API key. Se a key é `xyz-us12`, o prefix é `us12`.

Marque essas variáveis como **encrypted** no painel Cloudflare.

Os merge fields que o Function usa no Mailchimp:
- `FNAME` (nome)
- `LNAME` (sobrenome)
- `PHONE` (telefone)
- `COMPANY` (empresa — pode precisar ser criado na audiência)
- `SOURCE` (slug da página de origem — pode precisar ser criado na audiência)

Confira em Mailchimp → Audience → Settings → Audience fields and merge tags. Se algum não existir, crie como texto.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Wrangler sobe o site + Functions em `http://localhost:8788`. Para testar o form localmente sem mandar para Mailchimp de verdade, deixe as env vars em branco — o Function retornará erro, mas você consegue testar UI/validação.

Para testar com Mailchimp:

```bash
echo "MAILCHIMP_API_KEY=xxx-us6
MAILCHIMP_AUDIENCE_ID=xxx
MAILCHIMP_SERVER_PREFIX=us6" > .dev.vars

npm run dev
```

`.dev.vars` está no `.gitignore`.

## Deploy

### Opção 1 — via Git (recomendado)

1. Suba o repositório no GitHub.
2. Cloudflare Pages → Create application → Connect to Git → selecione o repo.
3. Configurações de build:
   - **Framework preset:** None
   - **Build command:** (deixar vazio)
   - **Build output directory:** `public`
   - **Root directory:** `/`
4. Adicione as três env vars na seção Environment variables.
5. Save and Deploy.

Cada push em `main` dispara redeploy automático.

### Opção 2 — via wrangler CLI

```bash
npx wrangler login
npm run deploy
```

## Domínio (consultoria.templum.com.br)

Depois do primeiro deploy, em Cloudflare Pages → Custom domains, adicione `consultoria.templum.com.br`. Se o domínio já está no Cloudflare, o DNS é ajustado automaticamente. Se está em outro lugar, será necessário apontar um CNAME.

**Importante:** só finalize o switch DNS depois de:
1. Todas as páginas estarem migradas (39 páginas)
2. Form testado em produção (lead chegando no Mailchimp)
3. Pelo menos uma página com isca PDF testada (download liberado)

## Páginas migradas (status)

| Slug                                                                         | Status     | Isca                                                                 |
| ---------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| `gestao-de-riscos-e-oportunidades-guia-avancado-e-pratico`                   | ✅ piloto  | PDF (CloudFront)                                                     |
| `planilha-analise-swot`                                                      | ✅ piloto  | Google Sheets                                                        |
| (37 restantes)                                                               | ⏳ pendente | ver `data/iscas.json`                                                |

Redirects diretos (não viram landing — vão direto pro destino) em `public/_redirects`:
- `/iso-45001` → `templum.com.br/consultoria/iso-45001`
- `/iso_9001` → `templum.com.br/consultoria/iso-9001`
- `/pbqp-h` → `templum.com.br/consultoria/pbqp-h`
- `/iso-9001-diagnostico` → `diagnostico-templum.lovable.app`

## Próximo passo

1. Suba o projeto, configure env vars e teste as 2 piloto em produção (Cloudflare Pages dá uma URL `*.pages.dev` antes do domínio final).
2. Confirme: form submete → lead aparece no Mailchimp → link da isca abre.
3. Aprovado → escalo para as 37 páginas restantes (mesmo padrão, copy adaptada).
