// Cloudflare Pages Function — POST /api/subscribe
// Receives lead form, creates contact in Mailchimp, returns the isca URL.
//
// Required env vars (set in Cloudflare Pages > Settings > Environment variables):
//   MAILCHIMP_API_KEY      — e.g. abc123def456-us6
//   MAILCHIMP_AUDIENCE_ID  — e.g. a1b2c3d4e5
//   MAILCHIMP_SERVER_PREFIX — e.g. us6  (the part after the dash in the api key)
//
// The isca URLs are stored in /data/iscas.json which is bundled into the Function via import.

import iscas from "../../data/iscas.json";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function md5(str) {
  // Mailchimp requires MD5 of the lowercase email as the member id (for PUT upserts).
  // Tiny pure-JS MD5 — adequate for this single use.
  function rh(d, n) { return (d << n) | (d >>> (32 - n)); }
  function add(a, b) { return (a + b) & 0xffffffff; }
  function f(x, y, z) { return (x & y) | ((~x) & z); }
  function g(x, y, z) { return (x & z) | (y & (~z)); }
  function h(x, y, z) { return x ^ y ^ z; }
  function i(x, y, z) { return y ^ (x | (~z)); }
  function ff(a, b, c, d, x, s, t) { return add(rh(add(add(a, f(b, c, d)), add(x, t)), s), b); }
  function gg(a, b, c, d, x, s, t) { return add(rh(add(add(a, g(b, c, d)), add(x, t)), s), b); }
  function hh(a, b, c, d, x, s, t) { return add(rh(add(add(a, h(b, c, d)), add(x, t)), s), b); }
  function ii(a, b, c, d, x, s, t) { return add(rh(add(add(a, i(b, c, d)), add(x, t)), s), b); }
  const msg = unescape(encodeURIComponent(str));
  const n = msg.length;
  const w = [];
  for (let j = 0; j < n; j++) w[j >> 2] = (w[j >> 2] || 0) | (msg.charCodeAt(j) << ((j % 4) * 8));
  w[n >> 2] = (w[n >> 2] || 0) | (0x80 << ((n % 4) * 8));
  w[(((n + 8) >> 6) * 16) + 14] = n * 8;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let j = 0; j < w.length; j += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, w[j + 0] | 0, 7, -680876936);
    d = ff(d, a, b, c, w[j + 1] | 0, 12, -389564586);
    c = ff(c, d, a, b, w[j + 2] | 0, 17, 606105819);
    b = ff(b, c, d, a, w[j + 3] | 0, 22, -1044525330);
    a = ff(a, b, c, d, w[j + 4] | 0, 7, -176418897);
    d = ff(d, a, b, c, w[j + 5] | 0, 12, 1200080426);
    c = ff(c, d, a, b, w[j + 6] | 0, 17, -1473231341);
    b = ff(b, c, d, a, w[j + 7] | 0, 22, -45705983);
    a = ff(a, b, c, d, w[j + 8] | 0, 7, 1770035416);
    d = ff(d, a, b, c, w[j + 9] | 0, 12, -1958414417);
    c = ff(c, d, a, b, w[j + 10] | 0, 17, -42063);
    b = ff(b, c, d, a, w[j + 11] | 0, 22, -1990404162);
    a = ff(a, b, c, d, w[j + 12] | 0, 7, 1804603682);
    d = ff(d, a, b, c, w[j + 13] | 0, 12, -40341101);
    c = ff(c, d, a, b, w[j + 14] | 0, 17, -1502002290);
    b = ff(b, c, d, a, w[j + 15] | 0, 22, 1236535329);
    a = gg(a, b, c, d, w[j + 1] | 0, 5, -165796510);
    d = gg(d, a, b, c, w[j + 6] | 0, 9, -1069501632);
    c = gg(c, d, a, b, w[j + 11] | 0, 14, 643717713);
    b = gg(b, c, d, a, w[j + 0] | 0, 20, -373897302);
    a = gg(a, b, c, d, w[j + 5] | 0, 5, -701558691);
    d = gg(d, a, b, c, w[j + 10] | 0, 9, 38016083);
    c = gg(c, d, a, b, w[j + 15] | 0, 14, -660478335);
    b = gg(b, c, d, a, w[j + 4] | 0, 20, -405537848);
    a = gg(a, b, c, d, w[j + 9] | 0, 5, 568446438);
    d = gg(d, a, b, c, w[j + 14] | 0, 9, -1019803690);
    c = gg(c, d, a, b, w[j + 3] | 0, 14, -187363961);
    b = gg(b, c, d, a, w[j + 8] | 0, 20, 1163531501);
    a = gg(a, b, c, d, w[j + 13] | 0, 5, -1444681467);
    d = gg(d, a, b, c, w[j + 2] | 0, 9, -51403784);
    c = gg(c, d, a, b, w[j + 7] | 0, 14, 1735328473);
    b = gg(b, c, d, a, w[j + 12] | 0, 20, -1926607734);
    a = hh(a, b, c, d, w[j + 5] | 0, 4, -378558);
    d = hh(d, a, b, c, w[j + 8] | 0, 11, -2022574463);
    c = hh(c, d, a, b, w[j + 11] | 0, 16, 1839030562);
    b = hh(b, c, d, a, w[j + 14] | 0, 23, -35309556);
    a = hh(a, b, c, d, w[j + 1] | 0, 4, -1530992060);
    d = hh(d, a, b, c, w[j + 4] | 0, 11, 1272893353);
    c = hh(c, d, a, b, w[j + 7] | 0, 16, -155497632);
    b = hh(b, c, d, a, w[j + 10] | 0, 23, -1094730640);
    a = hh(a, b, c, d, w[j + 13] | 0, 4, 681279174);
    d = hh(d, a, b, c, w[j + 0] | 0, 11, -358537222);
    c = hh(c, d, a, b, w[j + 3] | 0, 16, -722521979);
    b = hh(b, c, d, a, w[j + 6] | 0, 23, 76029189);
    a = hh(a, b, c, d, w[j + 9] | 0, 4, -640364487);
    d = hh(d, a, b, c, w[j + 12] | 0, 11, -421815835);
    c = hh(c, d, a, b, w[j + 15] | 0, 16, 530742520);
    b = hh(b, c, d, a, w[j + 2] | 0, 23, -995338651);
    a = ii(a, b, c, d, w[j + 0] | 0, 6, -198630844);
    d = ii(d, a, b, c, w[j + 7] | 0, 10, 1126891415);
    c = ii(c, d, a, b, w[j + 14] | 0, 15, -1416354905);
    b = ii(b, c, d, a, w[j + 5] | 0, 21, -57434055);
    a = ii(a, b, c, d, w[j + 12] | 0, 6, 1700485571);
    d = ii(d, a, b, c, w[j + 3] | 0, 10, -1894986606);
    c = ii(c, d, a, b, w[j + 10] | 0, 15, -1051523);
    b = ii(b, c, d, a, w[j + 1] | 0, 21, -2054922799);
    a = ii(a, b, c, d, w[j + 8] | 0, 6, 1873313359);
    d = ii(d, a, b, c, w[j + 15] | 0, 10, -30611744);
    c = ii(c, d, a, b, w[j + 6] | 0, 15, -1560198380);
    b = ii(b, c, d, a, w[j + 13] | 0, 21, 1309151649);
    a = ii(a, b, c, d, w[j + 4] | 0, 6, -145523070);
    d = ii(d, a, b, c, w[j + 11] | 0, 10, -1120210379);
    c = ii(c, d, a, b, w[j + 2] | 0, 15, 718787259);
    b = ii(b, c, d, a, w[j + 9] | 0, 21, -343485551);
    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
  }
  const toHex = (n) => {
    let s = "";
    for (let k = 0; k < 4; k++) s += ("0" + ((n >> (k * 8)) & 0xff).toString(16)).slice(-2);
    return s;
  };
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: "Payload inválido." }, 400); }

  const nome = (body.nome || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const telefone = (body.telefone || "").trim();
  const empresa = (body.empresa || "").trim();
  const slug = (body.slug || "").trim();
  const tracking = body.tracking && typeof body.tracking === "object" ? body.tracking : {};
  const trk = (key) => String(tracking[key] || "").slice(0, 250); // Mailchimp text fields cap at 255

  if (!nome || !email || !telefone || !empresa || !slug) {
    return json({ ok: false, error: "Campos obrigatórios faltando." }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: "Email inválido." }, 400);
  }

  const iscaUrl = iscas[slug];
  if (iscaUrl === undefined) {
    return json({ ok: false, error: "Página não encontrada." }, 404);
  }

  // Cloudflare Pages env var names sometimes come saved with leading whitespace
  // depending on how they were pasted into the dashboard. Normalize key names
  // and trim values so a stray space doesn't break the lookup.
  const normEnv = {};
  for (const k of Object.keys(env || {})) {
    const v = env[k];
    normEnv[String(k).trim()] = typeof v === "string" ? v.trim() : v;
  }
  const MAILCHIMP_API_KEY = normEnv.MAILCHIMP_API_KEY;
  const MAILCHIMP_AUDIENCE_ID = normEnv.MAILCHIMP_AUDIENCE_ID;
  const MAILCHIMP_SERVER_PREFIX = normEnv.MAILCHIMP_SERVER_PREFIX;
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
    return json({ ok: false, error: "Integração de leads não configurada." }, 500);
  }

  const [firstName, ...rest] = nome.split(/\s+/);
  const lastName = rest.join(" ");
  const subscriberHash = md5(email);
  const mcUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`;

  try {
    const mcRes = await fetch(mcUrl, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "authorization": "Basic " + btoa("anystring:" + MAILCHIMP_API_KEY),
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: firstName || "",
          LNAME: lastName || "",
          PHONE: telefone,
          COMPANY: empresa,
          SOURCE: slug,
          // Last touch UTMs (origem da conversão)
          LT_SOURCE:  trk("lt_source"),
          LT_MEDIUM:  trk("lt_medium"),
          LT_CAMP:    trk("lt_campaign"),
          LT_CONTENT: trk("lt_content"),
          LT_TERM:    trk("lt_term"),
          // First touch UTMs (origem inicial da jornada)
          FT_SOURCE:  trk("ft_source"),
          FT_MEDIUM:  trk("ft_medium"),
          FT_CAMP:    trk("ft_campaign"),
          FT_CONTENT: trk("ft_content"),
          FT_TERM:    trk("ft_term"),
          // Click IDs (pra integração com Ads platforms)
          GCLID:      trk("gclid"),
          FBCLID:     trk("fbclid"),
          // Landing page que converteu
          LAND_PAGE:  trk("landing_page"),
        },
        tags: ["isca:" + slug],
      }),
    });

    if (!mcRes.ok) {
      const detail = await mcRes.text();
      console.error("Mailchimp error", mcRes.status, detail);
      return json({ ok: false, error: "Não foi possível registrar agora. Tente novamente." }, 502);
    }
  } catch (err) {
    console.error("Mailchimp fetch failed", err);
    return json({ ok: false, error: "Falha de comunicação com o servidor de leads." }, 502);
  }

  return json({ ok: true, iscaUrl: iscaUrl || null });
}
