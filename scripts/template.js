// Templum landing page renderer.
// Receives a page config object and returns the HTML string.
// Page config shape (see pages.js):
//   slug, type ("ebook" | "planilha"), title, metaDescription,
//   headlineHtml, subhead, benefits[], marqueeItems[],
//   stepsLede, steps[{num,title,text}], ctaTitle, ctaCopy, ctaItems[],
//   faqItems[{q,a}]
// Optional: ogTitle, ogDescription, comparison{neg[],pos[]}, audiences[]

const TYPE_DEFAULTS = {
  ebook: {
    badgeLabel: "Ebook gratuito",
    leadEyebrowIcon: "solar:document-text-linear",
    leadEyebrow: "Receba o ebook",
    leadTitle: "Preencha para liberar o download.",
    leadSub: "PDF · 100% gratuito · você recebe o link na hora.",
    formButton: "Quero o ebook",
    successHint: "O download abre em uma nova aba. Se não abrir, use o botão abaixo.",
    successCta: "Baixar ebook agora",
    successIcon: "solar:download-linear",
    ctaButton: "Quero o ebook",
    formatNote: "PDF",
  },
  planilha: {
    badgeLabel: "Planilha gratuita",
    leadEyebrowIcon: "solar:document-add-linear",
    leadEyebrow: "Receba a planilha",
    leadTitle: "Preencha para liberar o acesso.",
    leadSub: "Planilha pronta · sem custo · você recebe o link na hora.",
    formButton: "Quero a planilha",
    successHint: "A planilha abre em uma nova aba.",
    successCta: "Abrir planilha agora",
    successIcon: "solar:external-link-linear",
    ctaButton: "Quero a planilha",
    formatNote: "Planilha",
  },
};

function defaultFaq(type, formatNote) {
  return [
    {
      q: "O material tem custo?",
      a: `Não. É gratuito. Você só precisa preencher o formulário para receber o link.`,
    },
    {
      q: "Posso compartilhar com meu time?",
      a: `Pode. O uso interno na sua organização é livre, quanto mais gente lendo, melhor.`,
    },
    {
      q: "Vou receber outros emails depois?",
      a: `Eventualmente sim, novos materiais e dicas práticas. Cada email tem link para descadastrar com um clique.`,
    },
  ];
}

function renderBenefits(items) {
  return items
    .map(
      (b) => `
              <li class="check-item">
                <span class="check-circle"><iconify-icon icon="solar:check-read-linear"></iconify-icon></span>
                <span>${b}</span>
              </li>`
    )
    .join("");
}

function renderMarquee(items) {
  // Items can be plain strings or {text, orange:true}
  const inner = items
    .map((it) => {
      const t = typeof it === "string" ? { text: it } : it;
      const cls = t.orange ? " class=\"--orange\"" : "";
      return `<span${cls}>${t.text}</span><span class="dot"></span>`;
    })
    .join("");
  return inner + inner; // duplicate for seamless loop
}

function renderSteps(steps) {
  return steps
    .map(
      (s) => `
          <div class="step-card">
            <div class="step-num">${s.num}</div>
            <div class="step-title">${s.title}</div>
            <div class="step-text">${s.text}</div>
          </div>`
    )
    .join("");
}

function renderComparison(comp) {
  if (!comp) return "";
  return `
    <!-- COMPARAÇÃO -->
    <section class="section section--alt">
      <div class="container xl">
        <span class="eyebrow">Antes e depois</span>
        <h2>${comp.title}</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 32px;">
          <ul class="check-list">
            ${comp.neg
              .map(
                (t) => `
            <li class="check-item">
              <span class="check-cross"><iconify-icon icon="solar:close-circle-linear"></iconify-icon></span>
              <span>${t}</span>
            </li>`
              )
              .join("")}
          </ul>
          <ul class="check-list">
            ${comp.pos
              .map(
                (t) => `
            <li class="check-item">
              <span class="check-circle"><iconify-icon icon="solar:check-read-linear"></iconify-icon></span>
              <span>${t}</span>
            </li>`
              )
              .join("")}
          </ul>
        </div>
      </div>
    </section>`;
}

function renderAudiences(audiences) {
  if (!audiences) return "";
  const variants = ["", " --orange", " --navy"];
  return `
    <!-- PARA QUEM -->
    <section class="section section--alt">
      <div class="container xl">
        <span class="eyebrow">Indicado para</span>
        <h2>Quem precisa <em>tirar do papel</em>.</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-top: 32px;">
          ${audiences
            .map(
              (a, i) => `
          <div class="stat-card${variants[i % 3]}">
            <span class="label-caps">${a.tag}</span>
            <p class="paragraph" style="margin-top: 8px;${i % 3 ? " color: var(--cream);" : ""}">${a.hint}</p>
            <div class="num"><em>${String(i + 1).padStart(2, "0")}</em></div>
            <div class="lbl">${a.label}</div>
          </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderFaq(items) {
  return items
    .map(
      (f, i) => `
          <details class="faq-item"${i === 0 ? " open" : ""}>
            <summary class="faq-question">
              ${f.q}
              <iconify-icon icon="solar:alt-arrow-down-linear"></iconify-icon>
            </summary>
            <div class="faq-answer">${f.a}</div>
          </details>`
    )
    .join("");
}

export function render(page) {
  const t = TYPE_DEFAULTS[page.type];
  if (!t) throw new Error(`Unknown type "${page.type}" for slug ${page.slug}`);
  const title = page.title;
  const desc = page.metaDescription;
  const ogTitle = page.ogTitle || title.replace(" · Templum", "");
  const ogDesc = page.ogDescription || desc;
  const stepsLede = page.stepsLede || "Materiais escritos por quem implementa sistemas de gestão na prática. Sem teoria solta, direto para a decisão que você precisa tomar.";
  const stepsTitle = page.stepsTitle || "O que você vai encontrar.";
  const faqItems = (page.faqItems || []).concat(defaultFaq(page.type));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="theme-color" content="#FF5925" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  <meta property="og:type" content="website" />

  <link rel="icon" type="image/jpeg" href="/assets/favicon.jpeg" />
  <link rel="apple-touch-icon" href="/assets/favicon.jpeg" />

  <script src="/assets/tracking/config.js"></script>
  <script src="/assets/tracking/loader.js"></script>
  <script src="/assets/tracking/extras.js"></script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>
  <link rel="stylesheet" href="/assets/css/templum.css" />
</head>
<body data-slug="${page.slug}">

  <header class="topbar">
    <div class="topbar-inner">
      <a href="https://templum.com.br" class="templum-logo"><img src="/assets/templum-logo.png" alt="Templum" /></a>
      <a href="https://templum.com.br" class="link">Voltar ao site</a>
    </div>
  </header>

  <main>
    <!-- HERO -->
    <section class="hero">
      <div class="container xl">
        <div class="hero-panel">
          <span class="badge badge--orange-solid" style="margin-bottom: 32px;">${t.badgeLabel}</span>

          <div class="hero-grid">
            <div class="hero-content">
              <h1 class="hero-headline">${page.headlineHtml}</h1>
              <p class="hero-subhead">${page.subhead}</p>

              <ul class="check-list">${renderBenefits(page.benefits)}
              </ul>
            </div>

            <div class="hero-imageCol">
              <div class="lead-card">
                <span class="lead-eyebrow"><iconify-icon icon="${t.leadEyebrowIcon}"></iconify-icon> ${t.leadEyebrow}</span>
                <h2 class="lead-title">${t.leadTitle}</h2>
                <p class="lead-sub">${t.leadSub}</p>

                <form class="lead-form" data-lead-form novalidate>
                  <div class="lead-field">
                    <label for="nome">Nome</label>
                    <input id="nome" name="nome" type="text" autocomplete="name" placeholder="Como podemos te chamar" required />
                  </div>
                  <div class="lead-field">
                    <label for="email">Email corporativo</label>
                    <input id="email" name="email" type="email" autocomplete="email" placeholder="voce@empresa.com.br" required />
                  </div>
                  <div class="lead-field">
                    <label for="telefone">Telefone (WhatsApp)</label>
                    <input id="telefone" name="telefone" type="tel" autocomplete="tel" placeholder="(11) 90000-0000" required />
                  </div>
                  <div class="lead-field">
                    <label for="empresa">Empresa</label>
                    <input id="empresa" name="empresa" type="text" autocomplete="organization" placeholder="Razão social ou nome fantasia" required />
                  </div>

                  <div class="lead-error" data-lead-error></div>

                  <button type="submit" class="btn btn--primary btn--lg btn--block" data-lead-submit>
                    ${t.formButton}
                    <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
                  </button>
                </form>

                <div class="lead-success" data-lead-success>
                  <div class="check"><iconify-icon icon="solar:check-read-linear"></iconify-icon></div>
                  <h3>Pronto. O acesso está liberado.</h3>
                  <p>${t.successHint}</p>
                  <a href="#" class="btn btn--primary btn--lg" data-isca-link target="_blank" rel="noopener">
                    ${t.successCta}
                    <iconify-icon icon="${t.successIcon}"></iconify-icon>
                  </a>
                </div>

                <div class="lead-foot">
                  Ao enviar, você concorda em receber materiais da Templum. Você pode descadastrar a qualquer momento.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MARQUEE -->
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">${renderMarquee(page.marqueeItems)}</div>
    </div>

    <!-- O QUE TEM DENTRO -->
    <section class="section">
      <div class="container xl">
        <span class="eyebrow">O que tem dentro</span>
        <h2>${stepsTitle}</h2>
        <p class="lede">${stepsLede}</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">${renderSteps(page.steps)}
        </div>
      </div>
    </section>
${renderComparison(page.comparison)}${renderAudiences(page.audiences)}

    <!-- CTA DARK -->
    <section class="section">
      <div class="container xl">
        <div class="cta-dark">
          <span class="badge badge--orange-solid">${t.formatNote} gratuito</span>
          <h3 style="margin-top: 16px;">${page.ctaTitle}</h3>
          <p>${page.ctaCopy}</p>
          <ul class="check-list" style="max-width: 540px; margin-bottom: 24px;">
            ${page.ctaItems
              .map(
                (i) => `
            <li class="check-item"><span class="check-circle"><iconify-icon icon="solar:check-read-linear"></iconify-icon></span><span>${i}</span></li>`
              )
              .join("")}
          </ul>
          <a href="#" onclick="document.querySelector('#nome').focus(); return false;" class="btn btn--primary btn--lg">
            ${t.ctaButton}
            <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
          </a>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section section--alt">
      <div class="container md">
        <span class="eyebrow">Dúvidas frequentes</span>
        <h2>Antes de baixar.</h2>
        <p class="lede">As perguntas mais comuns sobre o material.</p>

        <div class="faq-list">${renderFaq(faqItems)}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container xl footer-inner">
      <div class="footer-row">
        <div class="footer-brand">
          <a href="https://templum.com.br" class="templum-logo onDark"><img src="/assets/templum-logo.png" alt="Templum" /></a>
          <p>Consultoria em sistemas de gestão. ISO 9001, 14001, 45001, 27001 e PBQP-H, implementação que sustenta certificação e gera resultado de negócio.</p>
        </div>
        <div class="footer-links">
          <a href="https://templum.com.br">Site institucional</a>
          <a href="https://templum.com.br/consultoria/iso-9001">ISO 9001</a>
          <a href="https://templum.com.br/consultoria/iso-45001">ISO 45001</a>
          <a href="https://templum.com.br/consultoria/pbqp-h">PBQP-H</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© Templum Consultoria. Todos os direitos reservados.</span>
        <span>Política de privacidade · LGPD</span>
      </div>
    </div>
  </footer>

  <script src="/assets/js/form.js" defer></script>
</body>
</html>
`;
}
