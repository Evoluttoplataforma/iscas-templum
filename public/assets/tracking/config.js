/* Tracking-kit config — Templum Iscas
 * Edite os IDs aqui quando estiverem disponíveis. Plataforma com ID vazio fica
 * desligada (script da plataforma nem carrega).
 *
 * Onde achar cada ID:
 *   meta.pixelId           — Gerenciador de Eventos Meta → Pixel → ID
 *   googleAds.conversionId — Google Ads → Ferramentas → Conversões → AW-XXXXXXXXXX
 *   googleAds.leadLabel    — mesma tela, em "ID de etiqueta de conversão"
 *   ga4.measurementId      — GA4 → Admin → Streams de dados → ID de medição (G-XXXXX)
 */
window.TRACKING_CONFIG = {
  client:    { name: 'templum-iscas', debug: false, shadow: false },
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

  // Meta (Facebook/Instagram)
  meta:      { pixelId: '', capi: false, advancedMatching: true, ctwa: false },

  // Google Ads
  googleAds: { conversionId: '', leadLabel: '', enhancedConversions: true, offlineConversions: false },

  // GA4
  ga4:       { measurementId: '', apiSecret: '', engagementTracking: true },

  // TikTok / Clarity desligados nessa fase
  tiktok:    { pixelId: '', eventsApi: false },
  clarity:   { projectId: '' },

  // Server-side desligado nessa fase (V1 client-side puro).
  // Quando subir n8n + Supabase, preencha endpoint e ative capi/eventsApi/apiSecret acima.
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
