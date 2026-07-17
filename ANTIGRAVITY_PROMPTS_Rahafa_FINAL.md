# ANTIGRAVITY_PROMPTS.md — Rahafa Gold & Silver Management App

## Cara Pakai

1. Copy `BLUEPRINT_Rahafa.md` ke root project sebagai `BLUEPRINT.md`.
2. Jalankan prompt bertahap di Antigravity.
3. Jangan build semua sekaligus sebelum database dan flow stok jelas.
4. Setelah 1 fitur selesai, test dulu di browser/HP.

---

## Prompt 1 — Setup Project

```text
Buat project baru untuk aplikasi "Rahafa Stock & Invoice".

Baca BLUEPRINT.md sebagai sumber kebenaran utama.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase untuk database dan storage
- Auth MVP custom: login pakai nomor WhatsApp + PIN/password, bukan email
- Deploy-ready ke Vercel

Buat struktur project yang rapi:
- app/
- components/
- lib/
- types/
- styles/
- supabase/migrations atau schema SQL
- README.md
- BLUEPRINT.md

Aplikasi harus responsive untuk mobile, tablet, dan desktop.

Buat halaman awal sederhana:
- Login page dengan nomor WhatsApp + PIN/password
- Dashboard setelah login
- Sidebar/navigation mobile-friendly

Menu utama yang harus disiapkan:
- Dashboard
- Produk
- Harga Hari Ini
- Barang Masuk
- Stok Akhir
- Buat Invoice
- Buyback
- Laporan
- Settings

Jangan build semua fitur dulu. Setup dulu sampai bisa running dan preview.
```

---

## Prompt 1B — Ubah Auth Jadi Login Nomor WhatsApp

```text
Update sistem login aplikasi Rahafa.

Keputusan final:
- Jangan gunakan email sebagai username.
- Username utama adalah Nomor WhatsApp.
- Login MVP memakai Nomor WhatsApp + PIN/password.
- Terima input nomor dalam format 0853..., 62853..., atau +62853...
- Normalisasi semua nomor ke format 62xxxxxxxxxx sebelum disimpan/dicocokkan.
- OTP WhatsApp otomatis TIDAK perlu dibuat di MVP.

Yang harus dibuat:
1. Update Login Page:
   - Field "Nomor WhatsApp"
   - Field "PIN / Password"
   - Tombol "Masuk"
   - Validasi nomor kosong / PIN kosong
   - Pesan error aman: "Nomor WhatsApp atau PIN salah"

2. Update database users/profiles:
   - name
   - whatsapp_number
   - whatsapp_number_normalized unique
   - pin_hash atau password_hash
   - role: owner/admin/kasir
   - is_active
   - last_login_at

3. Buat helper function:
   - normalizeWhatsappNumber(input)
   - contoh:
     085384109496 -> 6285384109496
     +6285384109496 -> 6285384109496
     6285384109496 -> 6285384109496

4. Buat session login:
   - Setelah login berhasil, simpan session cookie httpOnly.
   - Proteksi semua halaman dashboard.
   - Kalau belum login, redirect ke /login.
   - Tambahkan logout.

5. Buat seed user owner:
   - Nama: Owner Rahafa
   - Nomor WhatsApp: 0853-8410-9496
   - Role: owner
   - PIN/password awal: 123456
   - Setelah login pertama, tampilkan warning untuk mengganti PIN/password.

Security:
- Jangan simpan PIN/password plaintext.
- Hash PIN/password.
- Jangan expose service role key ke client.
- Semua proses cek login dilakukan server-side.

Setelah selesai, test:
- Login pakai 085384109496
- Login pakai +6285384109496
- Login pakai 6285384109496
- Login dengan PIN salah harus gagal.
- Dashboard tidak boleh bisa dibuka tanpa login.
```

---

## Prompt 2 — Database Schema Supabase

```text
Baca BLUEPRINT.md.

Buat schema database Supabase untuk aplikasi Rahafa Stock & Invoice.

Gunakan konsep "stok detail modal" di UI, tetapi nama tabel database boleh menggunakan stock_batches.

Tabel yang dibutuhkan:
1. users/profiles
2. user_sessions
3. products
4. customers
5. stock_batches
6. daily_prices
7. transactions
8. transaction_items
9. settings

Detail penting:

users/profiles:
- name
- whatsapp_number
- whatsapp_number_normalized unique
- pin_hash atau password_hash
- role: owner/admin/kasir
- is_active
- last_login_at

user_sessions:
- user_id
- session_token_hash
- expires_at
- created_at
- revoked_at

products:
- name
- category: gold/silver
- type
- weight
- unit
- is_active

customers:
- name
- phone
- address
- customer_type: general/reseller
- notes

stock_batches:
- product_id
- source_type: supplier/buyback/opening_stock/adjustment
- source_ref_id
- date_in
- quantity_in
- quantity_remaining
- cost_price
- supplier_name
- customer_id
- status: ready/hold/sold_out/cancelled
- notes

daily_prices:
- product_id
- date
- retail_sell_price
- reseller_sell_price
- buyback_price
- status: draft/active/archived
- notes

transactions:
- transaction_number
- transaction_type: sale_general/sale_reseller/buyback
- customer_id
- transaction_date
- total_amount
- amount_paid
- remaining_amount
- payment_method
- status: draft/final/cancelled
- notes
- created_by

transaction_items:
- transaction_id
- product_id
- stock_batch_id
- quantity
- unit_price
- cost_price
- profit
- notes

settings:
- store_name
- tagline
- phone
- logo_url
- invoice_prefix
- buyback_prefix
- invoice_footer
- minimum_margin_amount
- minimum_margin_percent
- owner_override_pin_hash

Pastikan ada:
- primary key UUID
- foreign key
- created_at
- updated_at
- enum/check constraint untuk status dan transaction_type
- index untuk product_id, date, transaction_date, transaction_type
- quantity_remaining tidak boleh negatif
- invoice/transaction number unik

Auth requirement:
- Jangan gunakan email sebagai username.
- Login memakai nomor WhatsApp + PIN/password.
- Terima input nomor format 0853..., 62853..., atau +62853..., lalu normalisasi ke 62...
- Semua operasi database dilakukan server-side melalui API routes/server actions.
- Jangan expose Supabase service role key ke client.
- Untuk MVP, boleh gunakan custom session cookie httpOnly.
- OTP WhatsApp otomatis jangan dibuat dulu, cukup siapkan sebagai future feature.

Tambahkan akses control basic di server:
- owner/admin bisa akses semua data
- kasir bisa input transaksi dan lihat produk/stok/harga yang dibutuhkan
- profit/cost_price sebaiknya hanya terlihat oleh owner/admin

Buat file SQL migration dan types TypeScript.
```

---

## Prompt 3 — Seed Data Produk Awal Rahafa

```text
Baca BLUEPRINT.md, terutama Appendix A — Master Produk Rahafa Berdasarkan Data Barang 24 Juni 2026.

Buat seed data produk awal untuk Rahafa sesuai daftar final berikut.

PENTING:
- Gunakan Kode Barang sebagai kode yang terlihat oleh admin.
- Gunakan Kode Sistem sebagai kode aman untuk database/import.
- Harga Jual Umum Awal dipakai sebagai draft harga pertama di menu Harga Hari Ini.
- Jangan jadikan harga ini sebagai modal stok.
- Harga reseller dan buyback boleh NULL/kosong dulu karena akan diupdate dari menu Harga Hari Ini.
- Produk harus bisa dicari berdasarkan kode, nama, kategori, jenis/model, dan gramasi.

Daftar produk final:
- A05 | A05 | ANTAM 0.5 Gram | Emas | ANTAM | 0.5 gram | Harga awal 1,566,000
- A1 | A1 | ANTAM 1 Gram | Emas | ANTAM | 1 gram | Harga awal 2,852,000
- A2 | A2 | ANTAM 2 Gram | Emas | ANTAM | 2 gram | Harga awal 5,554,000
- A3 | A3 | ANTAM 3 Gram | Emas | ANTAM | 3 gram | Harga awal 8,251,000
- A5 | A5 | ANTAM 5 Gram | Emas | ANTAM | 5 gram | Harga awal 13,285,000
- A10 | A10 | ANTAM 10 Gram | Emas | ANTAM | 10 gram | Harga awal 26,270,000
- A25 | A25 | ANTAM 25 Gram | Emas | ANTAM | 25 gram | Harga awal 65,375,000
- A50 | A50 | ANTAM 50 Gram | Emas | ANTAM | 50 gram | Harga awal 130,850,000
- A100 | A100 | ANTAM 100 Gram | Emas | ANTAM | 100 gram | Harga awal 261,200,000
- R05 | R05 | RETRO ANTAM 0.5 GRAM | Emas | RETRO ANTAM | 0.5 gram | Harga awal 1,565,000
- R1 | R1 | RETRO ANTAM 1 GRAM | Emas | RETRO ANTAM | 1 gram | Harga awal 2,746,000
- R2 | R2 | RETRO ANTAM 2 GRAM | Emas | RETRO ANTAM | 2 gram | Harga awal 5,412,000
- R2,5 | R2_5 | RETRO ANTAM 2,5 GRAM | Emas | RETRO ANTAM | 2.5 gram | Harga awal 6,871,000
- R3 | R3 | RETRO ANTAM 3 GRAM | Emas | RETRO ANTAM | 3 gram | Harga awal 8,183,000
- R5 | R5 | RETRO ANTAM 5 GRAM | Emas | RETRO ANTAM | 5 gram | Harga awal 13,330,000
- R10 | R10 | RETRO ANTAM 10 GRAM | Emas | RETRO ANTAM | 10 gram | Harga awal 26,760,000
- RG0025 | RG0025 | MINIGOLD REGULER 0.025 | Emas | MINIGOLD REGULER | 0.025 gram | Harga awal 73,000
- RG005 | RG005 | MINIGOLD REGULER 0.05 | Emas | MINIGOLD REGULER | 0.05 gram | Harga awal 136,000
- RG01 | RG01 | MINIGOLD REGULER 0.1 | Emas | MINIGOLD REGULER | 0.1 gram | Harga awal 265,000
- RG025 | RG025 | MINIGOLD REGULER 0.25 | Emas | MINIGOLD REGULER | 0.25 gram | Harga awal 658,000
- RG05 | RG05 | MINIGOLD REGULER 0.5 | Emas | MINIGOLD REGULER | 0.5 gram | Harga awal 1,272,000
- RG1 | RG1 | MINIGOLD REGULER 1 | Emas | MINIGOLD REGULER | 1 gram | Harga awal 2,526,000
- RG15 | RG15 | MINIGOLD REGULER 1.5 | Emas | MINIGOLD REGULER | 1.5 gram | Harga awal 3,747,000
- M01 | M01 | MICRO GOLD 0.1 | Emas | MICRO GOLD | 0.1 gram | Harga awal 408,000
- M025 | M025 | MICRO GOLD 0.25 | Emas | MICRO GOLD | 0.25 gram | Harga awal 844,000
- S3,3 | S3_3 | SILVERIUM REGULER 3,3 GRAM | Perak | SILVERIUM REGULER | 3.3 gram | Harga awal 185,000
- S9,9 | S9_9 | SILVERIUM REGULER 9,9 GRAM | Perak | SILVERIUM REGULER | 9.9 gram | Harga awal 547,000
- S33 | S33 | SILVERIUM REGULER 33 GRAM | Perak | SILVERIUM REGULER | 33 gram | Harga awal 1,762,000
- S50 | S50 | SILVERIUM REGULER 50 GRAM | Perak | SILVERIUM REGULER | 50 gram | Harga awal 2,700,000
- S99 | S99 | SILVERIUM REGULER 99 GRAM | Perak | SILVERIUM REGULER | 99 gram | Harga awal 5,258,000
- S250 | S250 | SILVERIUM REGULER 250 GRAM | Perak | SILVERIUM REGULER | 250 gram | Harga awal 12,985,000
- S500 | S500 | SILVERIUM REGULER 500 GRAM | Perak | SILVERIUM REGULER | 500 gram | Harga awal 25,295,000
- D1 | D1 | 1 DIRHAM ABA | Perak | DIRHAM ABA | 3.11 dirham | Harga awal 184,000
- D5 | D5 | 5 DIRHAM ABA | Perak | DIRHAM ABA | 15.55 dirham | Harga awal 879,000
- RP1 | RP1 | 1 RUPIYA | Perak | RUPIYA | 3.11 rupiya | Harga awal 156,000
- RP5 | RP5 | 5 RUPIYA | Perak | RUPIYA | 15.55 rupiya | Harga awal 754,000
- S5 IDUL FITRI | S5_IDUL_FITRI | SILVERIUM IDUL FITRI 5 GR | Perak | SILVERIUM IDUL FITRI | 5 gram | Harga awal 322,000
- S25 IDUL FITRI | S25_IDUL_FITRI | SILVERIUM LIMITED EDITION 25 GR | Perak | SILVERIUM LIMITED EDITION | 25 gram | Harga awal 1,417,000
- S50 IDUL FITRI | S50_IDUL_FITRI | SILVERIUM LIMITED EDITION 50 GR | Perak | SILVERIUM LIMITED EDITION | 50 gram | Harga awal 2,822,000
- S100 IDUL FITRI | S100_IDUL_FITRI | SILVERIUM LIMITED EDITION 100 GR | Perak | SILVERIUM LIMITED EDITION | 100 gram | Harga awal 5,484,000
- SP | SP | SILVERIUM PALESTINE 31.1 GRAM | Perak | SILVERIUM PALESTINE | 31.1 gram | Harga awal 1,858,000
- SAH99 | SAH99 | SILVERIUM ASMAUL HUSNA 99 GRAM | Perak | SILVERIUM ASMAUL HUSNA | 99 gram | Harga awal 5,258,000

Buat halaman Produk untuk melihat, menambah, edit, dan menonaktifkan produk.

UI:
- Mobile-first
- Search produk
- Filter kategori emas/perak
- Filter jenis/model
- Tampilkan kode barang dengan jelas
- Tombol tambah produk jelas

Pastikan data produk tersimpan di tabel products.
Jika sudah ada data produk, jangan duplicate; lakukan upsert berdasarkan Kode Sistem.
```

---

## Prompt 4 — Build Fitur Harga Hari Ini

```text
Implementasikan fitur "Harga Hari Ini" berdasarkan BLUEPRINT.md.

Halaman:
- /prices atau /harga-hari-ini

Fungsi:
1. Pilih tanggal harga.
2. Tampilkan tabel produk aktif.
3. Kolom harga:
   - Harga Jual Umum
   - Harga Reseller
   - Harga Buyback
4. Tombol "Copy Harga Kemarin".
5. Tombol "Simpan Draft".
6. Tombol "Aktifkan Harga Hari Ini".
7. Histori harga per tanggal.

Aturan:
- Hanya satu harga aktif per produk per tanggal.
- Harga tidak boleh negatif.
- Jika harga reseller lebih besar dari harga jual umum, tampilkan warning.
- Jika harga buyback lebih besar dari harga jual umum, tampilkan warning.
- Saat copy harga kemarin, sistem duplikasi semua harga produk dari tanggal aktif sebelumnya ke tanggal hari ini sebagai draft.
- Saat aktifkan, status menjadi active.

UI:
- Input angka format rupiah.
- Tabel tetap enak dipakai di HP.
- Ada search produk.
- Ada filter kategori emas/perak.
- Ada indikator "Draft" dan "Aktif".

Setelah selesai, test:
- Buat harga hari ini dari nol.
- Copy harga kemarin.
- Edit harga reseller.
- Edit harga buyback.
- Aktifkan harga.
```

---

## Prompt 5 — Build Fitur Barang Masuk + Stok Detail Modal

```text
Implementasikan fitur Barang Masuk dan Stok Akhir berdasarkan BLUEPRINT.md.

Halaman yang harus dibuat:
1. /stock-in atau /barang-masuk
2. /stock atau /stok-akhir

Fungsi Barang Masuk:
- Input stok masuk dari supplier/stok awal/koreksi.
- Pilih produk.
- Input tanggal masuk.
- Input qty.
- Input harga modal per pcs.
- Input supplier atau catatan.
- Simpan sebagai stock_batch dengan source_type supplier/opening_stock/adjustment.

Fungsi Stok Akhir:
- Tampilkan stok total per produk.
- Tampilkan detail modal stok ketika item dibuka.
- Tampilkan quantity_remaining per detail modal.
- Tampilkan harga jual umum, reseller, dan buyback hari ini.
- Hitung status:
  - Aman Jual Umum jika retail_sell_price >= cost_price + minimum margin
  - Aman Reseller jika reseller_sell_price >= cost_price + minimum margin
  - Margin Tipis jika profit di bawah minimum margin
  - Hold jika harga jual aktif < cost_price
- Filter kategori emas/perak.
- Search produk.

Validasi:
- Qty wajib > 0.
- Harga modal wajib > 0.
- Produk wajib dipilih.
- Stok tidak boleh minus.

UI:
- Jangan sebut "batch" di halaman utama.
- Sebut "Detail Modal Stok".
- Mobile-first.
- Ada badge status: Aman, Tipis, Hold, Sold Out.

Test:
- Input produk sama gramasi sama dengan modal berbeda.
- Pastikan stok total menjumlah.
- Pastikan detail modal tampil benar.
- Pastikan status berubah mengikuti harga hari ini.
```

---

## Prompt 6 — Build Fitur Penjualan Umum & Reseller

```text
Implementasikan fitur Buat Invoice untuk penjualan umum dan reseller berdasarkan BLUEPRINT.md.

Halaman:
- /sales/new atau /buat-invoice
- /sales/[id] atau /invoice/[id]

Fungsi:
1. Admin pilih tipe transaksi:
   - Penjualan Umum
   - Penjualan Reseller
2. Input/pilih customer.
3. Jika customer bertipe reseller, default transaksi adalah reseller.
4. Pilih produk dan qty.
5. Sistem otomatis isi harga:
   - sale_general → retail_sell_price aktif hari ini
   - sale_reseller → reseller_sell_price aktif hari ini
6. Admin boleh override harga manual dengan catatan.
7. Sistem memilih stok detail modal yang aman:
   - quantity_remaining cukup
   - cost_price <= harga jual
   - prioritas ambil cost_price tertinggi yang masih tidak minus
8. Jika tidak ada stok aman, tampilkan warning:
   "Harga jual lebih rendah dari modal. Disarankan HOLD stok ini."
9. Jika tetap ingin jual minus, minta PIN owner/override flag.
10. Simpan transaksi final.
11. Kurangi stock_batches.quantity_remaining.
12. Buat invoice.

Data invoice:
- Logo Rahafa
- RAHAFA
- EMAS & SILVER
- Pusat jual beli Emas & Perak Bangka Belitung
- No. Telp admin 0853-8410-9496
- No invoice
- Tanggal
- Nama customer
- No WA
- Detail barang
- Gramasi
- Qty
- Harga satuan
- Total
- DP/Terbayar
- Sisa pembayaran
- Catatan

Output:
- Tampilan invoice responsive.
- Tombol Print.
- Tombol Download PDF.
- Tombol Kirim WhatsApp via wa.me.

Profit dan modal:
- Simpan cost_price dan profit di transaction_items.
- Jangan tampilkan profit/modal ke customer.
- Profit hanya untuk laporan owner/admin.

Test:
- Jual customer umum.
- Jual reseller.
- Harga default berubah sesuai tipe transaksi.
- Stok berkurang.
- Invoice print layout rapi.
- Warning muncul jika harga jual di bawah modal.
```

---

## Prompt 7 — Build Fitur Buyback

```text
Implementasikan fitur Buyback berdasarkan BLUEPRINT.md.

Halaman:
- /buyback/new atau /buyback
- /buyback/[id] atau /nota-buyback/[id]

Fungsi:
1. Admin input/pilih customer/penjual:
   - Nama
   - Nomor WhatsApp
2. Pilih produk dan gramasi.
3. Input qty.
4. Sistem otomatis isi harga dari daily_prices.buyback_price aktif hari ini.
5. Admin boleh override harga buyback manual dengan catatan.
6. Input catatan/kondisi barang.
7. Simpan transaksi dengan transaction_type = buyback.
8. Saat transaksi final:
   - Buat record transaction.
   - Buat transaction_items.
   - Tambahkan stock_batches baru dengan:
     source_type = buyback
     source_ref_id = transaction id
     cost_price = harga buyback
     quantity_in = qty
     quantity_remaining = qty
     customer_id = penjual
9. Buat nota buyback.

Format nota buyback:
- Logo Rahafa
- RAHAFA
- EMAS & SILVER
- Judul: NOTA BUYBACK / PEMBELIAN KEMBALI
- No nota buyback
- Tanggal
- Nama penjual/customer
- No WA
- Detail barang
- Gramasi
- Qty
- Harga buyback
- Total pembayaran ke customer
- Metode pembayaran
- Catatan/kondisi barang

Output:
- Tombol Print.
- Tombol Download PDF.
- Tombol Kirim WA via wa.me.

Validasi:
- Produk wajib.
- Qty > 0.
- Harga buyback > 0.
- Jika tidak ada harga buyback aktif, minta input manual dan tampilkan warning.
- Jika nota buyback dibatalkan, stok dari buyback tersebut harus ikut cancelled/dikurangi.

Test:
- Buat buyback.
- Pastikan stok bertambah.
- Pastikan modal stok baru sama dengan harga buyback.
- Pastikan nota buyback bisa dicetak.
- Batalkan buyback dan pastikan stok ikut batal.
```

---

## Prompt 8 — Build Dashboard

```text
Buat dashboard utama berdasarkan BLUEPRINT.md.

Tampilkan kartu ringkas:
- Penjualan umum hari ini
- Penjualan reseller hari ini
- Total buyback hari ini
- Estimasi profit hari ini
- Jumlah transaksi hari ini
- Stok yang perlu Hold
- Piutang/sisa pembayaran

Tombol cepat:
- Update Harga Hari Ini
- Barang Masuk
- Buat Invoice
- Buyback
- Stok Akhir
- Laporan

Tambahkan section:
1. Transaksi terbaru.
2. Stok hold tertinggi.
3. Produk paling sering keluar minggu ini.

UI:
- Mobile-first.
- Angka format rupiah.
- Badge untuk sale_general, sale_reseller, dan buyback.
- Tidak menampilkan detail profit kepada role kasir.
```

---

## Prompt 9 — Build Laporan Harian/Bulanan/Stok

```text
Implementasikan fitur Laporan berdasarkan BLUEPRINT.md.

Halaman:
- /reports atau /laporan

Filter:
- Date range
- Jenis transaksi:
  - Semua
  - Penjualan umum
  - Reseller
  - Buyback
- Produk/kategori

Laporan harian:
- Total penjualan umum
- Total penjualan reseller
- Total buyback
- Total profit estimasi
- Jumlah transaksi
- Barang keluar
- Barang masuk dari supplier
- Barang masuk dari buyback
- Sisa pembayaran/piutang

Laporan bulanan:
- Total penjualan per bulan
- Total reseller per bulan
- Total buyback per bulan
- Total profit per bulan
- Produk paling sering terjual
- Total stok masuk
- Total stok keluar
- Rekap invoice
- Rekap nota buyback

Laporan stok akhir:
- Produk
- Gramasi
- Qty stok
- Nilai modal total
- Harga jual umum hari ini
- Harga reseller hari ini
- Harga buyback hari ini
- Status aman/hold
- Potensi profit di harga umum
- Potensi profit di harga reseller

Fitur:
- Export CSV.
- Print/PDF laporan.
- Summary mudah dibaca di HP.

Security:
- Profit dan modal hanya terlihat untuk owner/admin.
- Kasir boleh lihat ringkasan tanpa profit jika diperlukan.

Test:
- Filter laporan 1 hari.
- Filter laporan 1 bulan.
- Export CSV.
- Print PDF.
- Pastikan buyback masuk sebagai uang keluar dan stok masuk, bukan penjualan.
```

---

## Prompt 10 — Settings Invoice, Nota, dan Margin

```text
Implementasikan halaman Settings berdasarkan BLUEPRINT.md.

Fungsi:
- Upload logo toko ke Supabase Storage.
- Edit nama toko: RAHAFA
- Edit tagline: EMAS & SILVER
- Edit deskripsi: Pusat jual beli Emas & Perak Bangka Belitung
- Edit No. Telp admin: 0853-8410-9496
- Edit prefix invoice, contoh INV
- Edit prefix nota buyback, contoh BB
- Edit footer invoice/nota
- Set minimum margin:
  - nominal rupiah
  - persentase
- Set PIN owner untuk override jual minus.

Pastikan settings dipakai di:
- Invoice penjualan.
- Nota buyback.
- Laporan print/PDF.
- Dashboard status margin/hold.

Test:
- Upload logo.
- Ubah nomor admin.
- Buat invoice dan pastikan data toko berubah.
- Buat nota buyback dan pastikan data toko berubah.
- Set margin minimal dan pastikan warning muncul.
```

---

## Prompt 11 — Test Fungsionalitas Lengkap

```text
Test seluruh aplikasi Rahafa Stock & Invoice berdasarkan BLUEPRINT.md.

Skenario wajib:

1. Produk:
- Tambah produk emas.
- Tambah produk perak.
- Edit produk.
- Nonaktifkan produk.

2. Harga Hari Ini:
- Buat harga hari ini dari nol.
- Copy harga kemarin.
- Isi harga umum, reseller, buyback.
- Aktifkan harga.

3. Barang Masuk:
- Input stok 1gr modal Rp2.000.000 qty 10.
- Input stok 1gr modal Rp2.100.000 qty 5.
- Pastikan stok akhir total 15 dan detail modal terlihat.

4. Penjualan Umum:
- Jual 1gr harga Rp2.200.000.
- Pastikan sistem memilih stok aman.
- Pastikan stok berkurang.
- Invoice terbentuk.

5. Penjualan Reseller:
- Jual 1gr dengan harga reseller.
- Pastikan sistem tetap cek modal.
- Jika harga reseller di bawah modal, warning muncul.

6. Buyback:
- Buat buyback 1gr harga Rp1.950.000.
- Pastikan stok bertambah.
- Pastikan modal stok baru = Rp1.950.000.
- Nota buyback terbentuk.

7. Laporan:
- Cek laporan harian.
- Pastikan penjualan umum, reseller, dan buyback terpisah.
- Pastikan profit tidak memasukkan buyback sebagai penjualan.
- Export CSV/PDF.

8. Print/PDF:
- Print invoice.
- Print nota buyback.
- Print laporan.

9. Responsive:
- Test mobile 375px.
- Test tablet 768px.
- Test desktop 1280px.

Laporkan semua bug yang ditemukan dan perbaiki.
```

---

## Prompt 12 — Deploy

```text
Publish aplikasi Rahafa Stock & Invoice agar bisa diakses online.

Gunakan Vercel atau platform gratis yang cocok untuk Next.js.

Langkah:
1. Pastikan build production berhasil.
2. Pastikan environment variable Supabase sudah benar.
3. Deploy ke Vercel.
4. Berikan URL final.
5. Test URL online:
   - Login dengan nomor WhatsApp
   - Dashboard
   - Harga Hari Ini
   - Barang Masuk
   - Buat Invoice
   - Buyback
   - Laporan
   - Print invoice/nota

Jangan nyatakan selesai sebelum aplikasi online bisa diakses dan fitur MVP berhasil dites.
```
