/* Templum landing — form handler
   Submits {nome,email,telefone,empresa,slug, tracking{...}} to /api/subscribe.
   On success, swaps form for success state and reveals the isca URL returned by the API. */
(function () {
  const form = document.querySelector('[data-lead-form]');
  if (!form) return;

  const card = form.closest('.lead-card');
  const errorBox = card.querySelector('[data-lead-error]');
  const successBox = card.querySelector('[data-lead-success]');
  const successLink = successBox.querySelector('[data-isca-link]');
  const submitBtn = form.querySelector('[data-lead-submit]');
  const slug = (document.body.dataset.slug || window.location.pathname.replace(/^\/|\/$/g, '')).split('/')[0];

  function readCookie(name) {
    const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? decodeURIComponent(match.pop()) : '';
  }

  function getUrlParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name) || '';
    } catch (e) { return ''; }
  }

  // _fbc cookie format: "fb.1.<timestamp>.<fbclid>" — extract the fbclid tail.
  function parseFbcCookie() {
    const fbc = readCookie('_fbc');
    if (!fbc) return '';
    const parts = fbc.split('.');
    return parts.length >= 4 ? parts.slice(3).join('.') : '';
  }

  function collectTracking() {
    return {
      lt_source:   readCookie('lt_utm_source'),
      lt_medium:   readCookie('lt_utm_medium'),
      lt_campaign: readCookie('lt_utm_campaign'),
      lt_content:  readCookie('lt_utm_content'),
      lt_term:     readCookie('lt_utm_term'),
      ft_source:   readCookie('ft_utm_source'),
      ft_medium:   readCookie('ft_utm_medium'),
      ft_campaign: readCookie('ft_utm_campaign'),
      ft_content:  readCookie('ft_utm_content'),
      ft_term:     readCookie('ft_utm_term'),
      gclid:       getUrlParam('gclid')  || readCookie('_gcl_aw') || '',
      fbclid:      getUrlParam('fbclid') || parseFbcCookie(),
      landing_page: readCookie('trk_landing_page'),
    };
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('--show');
  }
  function clearError() { errorBox.classList.remove('--show'); }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.dataset.label = submitBtn.dataset.label || submitBtn.textContent.trim();
    submitBtn.textContent = loading ? 'Enviando…' : submitBtn.dataset.label;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearError();
    setLoading(true);

    const payload = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      telefone: form.telefone.value.trim(),
      empresa: form.empresa.value.trim(),
      slug: slug,
      tracking: collectTracking(),
    };

    if (!payload.nome || !payload.email || !payload.telefone || !payload.empresa) {
      setLoading(false);
      showError('Preencha todos os campos para receber o material.');
      return;
    }

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setLoading(false);
        showError(data.error || 'Não foi possível enviar agora. Tente novamente em instantes.');
        return;
      }

      form.style.display = 'none';
      const foot = card.querySelector('.lead-foot');
      if (foot) foot.style.display = 'none';
      successLink.href = data.iscaUrl;
      successBox.classList.add('--show');

      // Tracking: dispara Lead no kit (pixel + AW primários + GA4) e captura o
      // event_id. Depois passa o MESMO event_id pros extras (pixel + AW conta 2)
      // pra deduplicação browser↔servidor funcionar quando CAPI for ativado.
      var leadData = {
        email: payload.email,
        phone: payload.telefone,
        name: payload.nome,
        company: payload.empresa,
        isca: payload.slug,
      };
      var sharedEventId = null;
      if (window.trk && typeof window.trk.lead === 'function') {
        try { sharedEventId = window.trk.lead(leadData); } catch (e) { /* noop */ }
      }
      if (typeof window.trkExtrasLead === 'function') {
        try { window.trkExtrasLead(leadData, sharedEventId); } catch (e) { /* noop */ }
      }

      // auto-open after a short delay so the user sees the success state first
      setTimeout(() => { window.open(data.iscaUrl, '_blank', 'noopener'); }, 800);
    } catch (err) {
      setLoading(false);
      showError('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  });
})();
