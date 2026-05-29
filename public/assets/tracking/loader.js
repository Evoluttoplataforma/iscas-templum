/* Tracking-kit loader — carrega os módulos vanilla do tracking-kit via jsDelivr
 * com versão fixa. NÃO use @main em produção.
 *
 * Pré-requisito: window.TRACKING_CONFIG já tem que estar definida.
 * Veja /assets/tracking/config.js
 */
(function () {
  if (!window.TRACKING_CONFIG) {
    console.warn('[tracking-kit] TRACKING_CONFIG not found — loader skipped.');
    return;
  }
  var BASE = 'https://cdn.jsdelivr.net/gh/rodrigoosouza/tracking-kit@v1.0.0/src/';
  function load(file, cb) {
    var s = document.createElement('script');
    s.async = false;
    s.src = BASE + file;
    if (cb) s.onload = cb;
    document.head.appendChild(s);
  }
  load('01-capture.js', function () {
    load('02-dispatch.js', function () {
      load('03-engagement.js', function () {
        load('trk-helpers.js', function () {
          var I = window.TRACKING_CONFIG.integrations || {};
          var CD = window.TRACKING_CONFIG.crossDomain || {};
          if (I.calendly || I.typeform || I.tally || CD.enabled) load('integrations.js');
        });
      });
    });
  });
})();
