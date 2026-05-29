/* Extras: inicializa o 2º Pixel Meta e o 2º Conversion Google Ads em paralelo
 * aos primários carregados pelo tracking-kit.
 *
 * fbq e gtag aceitam múltiplos init/config nativamente — chamadas track() e
 * 'event' disparam pra todos os pixels/conversões registrados.
 *
 * Roda APÓS o kit ter carregado, polling curto pra esperar fbq e gtag existirem.
 */
(function () {
  var EX = window.TRACKING_EXTRAS;
  if (!EX) return;

  // Polling até fbq E gtag estarem prontos (o tracking-kit os instala).
  var tries = 0;
  var max = 100; // ~10s
  var iv = setInterval(function () {
    tries++;
    var fbqReady = typeof window.fbq === 'function';
    var gtagReady = typeof window.gtag === 'function';
    if (!fbqReady && !gtagReady && tries < max) return;
    clearInterval(iv);

    // Meta extra: init + PageView no segundo pixel
    if (fbqReady && EX.meta && EX.meta.pixelId) {
      try {
        window.fbq('init', String(EX.meta.pixelId));
        window.fbq('track', 'PageView');
      } catch (e) { /* noop */ }
    }

    // Google Ads extra: config no segundo conversion ID (PageView padrão do gtag)
    if (gtagReady && EX.googleAds && EX.googleAds.conversionId) {
      try {
        window.gtag('config', EX.googleAds.conversionId);
      } catch (e) { /* noop */ }
    }
  }, 100);

  // Helper exposto pra disparar Lead nos extras (chamado pelo form.js após sucesso).
  window.trkExtrasLead = function (data) {
    data = data || {};
    try {
      if (window.fbq && EX.meta && EX.meta.pixelId) {
        var props = {};
        if (data.email) props.em = data.email;
        if (data.phone) props.ph = data.phone;
        if (data.name) props.fn = data.name;
        window.fbq('trackSingle', String(EX.meta.pixelId), 'Lead', props);
      }
    } catch (e) { /* noop */ }
    try {
      if (window.gtag && EX.googleAds && EX.googleAds.conversionId && EX.googleAds.leadLabel) {
        window.gtag('event', 'conversion', {
          send_to: EX.googleAds.conversionId + '/' + EX.googleAds.leadLabel,
        });
      }
    } catch (e) { /* noop */ }
  };
})();
