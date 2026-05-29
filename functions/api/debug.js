// Temporary diagnostic endpoint. DELETE AFTER USE.
// Lists which env vars the Function can see at runtime, without leaking values.
// GET /api/debug

export async function onRequest(context) {
  const { env } = context;

  const all = Object.keys(env || {}).sort();

  const expected = ["MAILCHIMP_API_KEY", "MAILCHIMP_AUDIENCE_ID", "MAILCHIMP_SERVER_PREFIX"];
  const checks = {};
  for (const k of expected) {
    const v = env[k];
    if (v === undefined || v === null) {
      checks[k] = { present: false, length: 0, sample: null };
    } else {
      const s = String(v);
      checks[k] = {
        present: true,
        length: s.length,
        sample: s.length <= 6 ? s : `${s.slice(0, 2)}…${s.slice(-2)}`,
        hasWhitespace: /\s/.test(s),
      };
    }
  }

  return new Response(JSON.stringify({
    runtime: "cloudflare-pages-function",
    timestamp: new Date().toISOString(),
    allEnvKeys: all,
    expected: checks,
  }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
