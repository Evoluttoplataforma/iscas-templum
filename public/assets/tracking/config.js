/* Tracking-kit config — Templum Iscas
 * Edite os IDs aqui. Plataforma com ID vazio fica desligada.
 *
 * Esta página opera com DUAS contas Meta e DUAS contas Google Ads em paralelo.
 *   Pixel/Conversion PRIMÁRIO  → aqui no config (o tracking-kit cuida).
 *   Pixel/Conversion SECUNDÁRIO → /assets/tracking/extras.js (init + Lead manuais).
 *
 * Para ativar Meta CAPI no servidor depois, troque capi: true E adicione o
 * token + n8n endpoint (mantenha o token FORA do repo — env var no Cloudflare).
 */
window.TRACKING_CONFIG = {
  client:    { name: 'templum-iscas', debug: true, shadow: false },
  business:  {
    type: 'lead-gen-form',
    hasWhatsApp: false,
    hasForm: true,
    hasScheduling: false,
    hasEcommerce: false,
    hasRegistration: false,
    hasNewsletter: false,
    primaryConversion: 'Lead',
  },

  // Meta (conta 1 — primária no kit; conta 2 vai em extras.js)
  meta:      { pixelId: '953370546204625', capi: false, advancedMatching: true, ctwa: false },

  // Google Ads (conta 1 — primária no kit; conta 2 vai em extras.js)
  googleAds: { conversionId: 'AW-1065643610', leadLabel: 'QoYWCLyv0_sbEP7hlvZC', enhancedConversions: true, offlineConversions: false },

  // GA4 (uma única propriedade)
  ga4:       { measurementId: 'G-FV41GWD427', apiSecret: '', engagementTracking: true },

  // TikTok / Clarity não em uso nessa fase
  tiktok:    { pixelId: '', eventsApi: false },
  clarity:   { projectId: '' },

  // Server-side desligado (sem n8n + Supabase nessa fase)
  server:    {
    endpoint: '',
    sendOnEvents: ['Lead','PageView','Contact','Scroll','TimeOnPage','SectionView','CTAClick','FormStart','FormAbandon'],
    retryOnFail: 3,
  },

  capture:   {
    firstTouch: true,
    referrerMapping: true,
    geo: true,
    journeyMaxTouches: 20,
    deviceFingerprint: true,
    ctwaCapture: false,
    leadStorageKey: '__wl_lead',
  },

  engagement:{
    scroll: true,
    heartbeat: 30,
    sections: true,
    sectionVisibleMs: 2000,
    ctaTracking: true,
    formAnalytics: true,
    videoTracking: false,
  },

  consent:   { required: false, defaultGranted: false, cookieName: 'trk_consent' },
  helpers:   { whatsappNumber: '', whatsappMessage: '' },
  integrations: { calendly: false, typeform: false, tally: false },
  crossDomain:  { enabled: false, domains: [] },
};
window.TRACKING_KIT_VERSION = '1.0.0';

// Extras: pixels/conversions paralelos (Meta conta 2 + Google Ads conta 2).
// Inicializados aqui pra serem detectados pelo fbq/gtag que o kit carrega.
window.TRACKING_EXTRAS = {
  meta:      { pixelId: '4177249519256900' },              // Meta conta 2
  googleAds: { conversionId: 'AW-17896226473',
               leadLabel:    'Atq7CISCiusbEKn9ytVC' },     // Google Ads conta 2
};
