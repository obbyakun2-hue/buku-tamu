// Buku Tamu Digital — Worker pengirim ke Telegram (versi TERBUKA & atas persetujuan)
// Token bot TIDAK PERNAH ada di file ini / di GitHub. Token disimpan sebagai
// Secret di Cloudflare: Settings > Variables and Secrets >
//   TELEGRAM_BOT_TOKEN (Secret)  dan  TELEGRAM_CHAT_ID (Secret)
//
// Deploy: dash.cloudflare.com > Workers & Pages > Create > Worker >
// beri nama (mis. buku-tamu-worker) > Deploy > Edit code > tempel file ini >
// Deploy lagi > lalu isi 2 secret di atas > selesai.
// URL worker hasil deploy itulah yang diisi ke config.js (WORKER_URL).

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS } });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/")
      return json({ ok: true, service: "buku-tamu-worker", telegram_configured: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) });
    if (request.method !== "POST" || url.pathname !== "/send") return json({ ok: false, error: "not found" }, 404);
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID)
      return json({ ok: false, error: "Telegram belum dikonfigurasi di worker (secrets kosong)" }, 500);

    let form;
    try { form = await request.formData(); } catch { return json({ ok: false, error: "body bukan form-data" }, 400); }
    const photo = form.get("photo");
    if (!photo || typeof photo === "string" || photo.size === 0) return json({ ok: false, error: "foto wajib ada" }, 400);
    if (photo.size > 8 * 1024 * 1024) return json({ ok: false, error: "foto terlalu besar (maks 8MB)" }, 400);

    const lines = [
      "📖 <b>Buku Tamu Digital — tamu baru (atas persetujuan tamu)</b>",
      "",
      `👤 Nama: <b>${esc(form.get("nama") || "(tanpa nama)")}</b>`,
      `🕐 Waktu: ${esc(form.get("waktu") || "-")}`,
    ];
    if (form.get("alamat")) lines.push(`🏠 Alamat perkiraan: ${esc(form.get("alamat"))}`);
    if (form.get("maps")) lines.push(`📍 Lokasi: ${esc(form.get("maps"))}`);
    lines.push(`📱 Perangkat: ${esc(form.get("device") || "-")}`);
    lines.push(`🌐 Bahasa: ${esc(form.get("bahasa") || "-")}`);

    const tg = new FormData();
    tg.append("chat_id", env.TELEGRAM_CHAT_ID);
    tg.append("photo", photo, "tamu.jpg");
    tg.append("caption", lines.join("\n"));
    tg.append("parse_mode", "HTML");

    const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendPhoto`, { method: "POST", body: tg });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) return json({ ok: false, error: "Telegram menolak: " + (j.description || r.status) }, 502);
    return json({ ok: true });
  },
};
