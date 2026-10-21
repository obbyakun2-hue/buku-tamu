# 📖 Buku Tamu Digital (Terbuka & Atas Persetujuan)

Halaman buku tamu: pengunjung **mengetahui dengan jelas** bahwa foto yang ia ambil
sendiri + data kunjungan akan dikirim ke Telegram pemilik, dan pengiriman hanya
terjadi setelah ia mencentang persetujuan dan menekan tombol kirim sendiri.

> Versi ini SENGAJA bukan jebakan: tidak ada foto/lokasi otomatis, tidak ada
> pengambilan diam-diam. MAC address juga tidak dikumpulkan — browser memang
> memblokirnya untuk semua situs.

## Isi repo
- `index.html` — halaman buku tamu (GitHub Pages)
- `config.js` — satu-satunya file yang perlu diedit pemilik (`WORKER_URL`)
- `worker/worker.js` — server pengirim kecil di Cloudflare Workers.
  Token Telegram disimpan sebagai **Secret di Cloudflare**, tidak pernah di GitHub.

## Cara mengaktifkan pengiriman ke Telegram (±5 menit, sekali saja)

### 1) Deploy worker
1. Buka https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Worker**
2. Beri nama, mis. `buku-tamu-worker` → **Deploy**
3. Klik **Edit code**, hapus isi contoh, tempel seluruh isi `worker/worker.js` → **Deploy**
4. Kembali ke halaman worker → **Settings → Variables and Secrets → Add**:
   - `TELEGRAM_BOT_TOKEN` — tipe **Secret** — token bot dari @BotFather
   - `TELEGRAM_CHAT_ID` — tipe **Secret** — chat id kamu
5. Ingat: bot hanya bisa mengirimi kamu kalau kamu sudah pernah membuka bot itu
   dan menekan **START** di Telegram.
6. Salin URL worker-nya, contoh: `https://buku-tamu-worker.<akun>.workers.dev`

### 2) Sambungkan halaman ke worker
Edit `config.js`: isi `WORKER_URL` dengan URL worker di atas, lalu commit/push.
Selesai — badge "MODE DEMO" hilang dan tombol kirim benar-benar mengirim ke Telegram.

### 3) Test
Buka link Pages-nya, centang persetujuan, nyalakan kamera, ambil foto, kirim.
Foto + keterangan harus tiba di Telegram kamu.

## Data yang dikirim (tertulis terbuka di halaman)
Foto jepretan pengunjung sendiri, nama yang ia tulis, lokasi (hanya jika ia
mencentang + menyetujui izin lokasi browser), alamat perkiraan dari koordinat,
link Google Maps, jenis perangkat/browser, bahasa, dan waktu kunjungan (WIB).
