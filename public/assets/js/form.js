/* Templum landing — form handler
   Submits {nome,email,telefone,empresa,slug} to /api/subscribe.
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
      // auto-open after a short delay so the user sees the success state first
      setTimeout(() => { window.open(data.iscaUrl, '_blank', 'noopener'); }, 800);
    } catch (err) {
      setLoading(false);
      showError('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  });
})();
