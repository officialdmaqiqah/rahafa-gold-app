# BLUEPRINT.md — Rahafa Gold & Silver Management App

## 1. Overview

**Nama aplikasi sementara:** Rahafa Stock & Invoice  
**Target user:** Yuk Lili / admin Rahafa, penjual emas logam mulia dan perak di Bangka Belitung.  
**Tujuan utama:** Membantu pencatatan barang masuk, barang keluar, buyback, stok akhir, harga harian, invoice, dan laporan harian/bulanan dengan sistem yang ramah HP.

Aplikasi ini dibuat untuk bisnis emas/perak yang harga jual, harga reseller, dan harga buyback berubah setiap hari. Fokus aplikasi bukan sekadar kasir, tapi membantu admin tahu stok mana yang aman dijual, stok mana yang perlu di-hold, berapa harga jual yang aman, dan berapa sisa modal/profit berdasarkan barang yang masuk dari banyak harga modal berbeda.

## 2. Problem yang Diselesaikan

### Pain point utama dari obrolan

1. **Invoice dan pencatatan masih manual/screenshot**
   - Customer butuh invoice/nota.
   - Pemilik ingin invoice bisa dicetak untuk pencocokan akhir bulan.
   - Faktur manual berisiko hilang.

2. **Stok emas/perak punya modal berbeda-beda**
   - Contoh: emas 1 gram bisa dibeli di modal Rp2.000.000 dan Rp2.100.000.
   - Saat dijual, admin tidak selalu memilih stok berdasarkan modal tertentu.
   - Prinsip bisnis: boleh jual bebas asal tidak minus.

3. **Harga pasar berubah harian**
   - Harga modal bisa lebih tinggi dari harga jual pasar.
   - Jika modal > harga pasar, barang di-hold dan tidak dijual dulu.
   - Stok bisa bertambah lagi saat harga turun agar dapat modal lebih rendah.

4. **Ada beberapa jenis harga**
   - Harga jual umum/customer.
   - Harga reseller.
   - Harga buyback saat toko membeli kembali barang dari customer.
   - Harga-harga ini bisa berbeda setiap hari dan perlu histori.

5. **Buyback menambah stok baru**
   - Saat toko menerima buyback dari customer, itu bukan penjualan.
   - Sistem harus mencatat uang keluar, customer yang menjual, produk/gramasi, harga buyback, lalu stok toko bertambah dengan modal sesuai harga buyback tersebut.

6. **Butuh laporan harian dan bulanan**
   - Barang masuk.
   - Barang keluar.
   - Buyback masuk dari customer.
   - Stok akhir detail.
   - Nilai modal.
   - Potensi profit/loss.
   - Invoice per transaksi.

7. **Harus mobile-friendly**
   - Admin ingin bisa dipakai dari HP/tablet, tidak wajib komputer.
   - Tetap bisa print invoice saat dibutuhkan.

## 3. Prinsip Solusi

Aplikasi harus mengikuti gaya kerja Rahafa, bukan memaksa gaya toko umum.

Prinsip sistem:

- Sistem memakai konsep **stok detail modal** atau **batch tersembunyi**.
- User tidak perlu dipusingkan dengan istilah batch. Di tampilan utama cukup terlihat total stok, tapi sistem tetap menyimpan detail modal di belakang layar.
- Setiap stok disimpan berdasarkan tanggal masuk, produk, gramasi, jumlah, dan harga modal.
- Barang masuk bisa berasal dari:
  - Belanja/supplier.
  - Buyback dari customer.
  - Koreksi stok awal.
- Saat transaksi penjualan, sistem membantu memilih stok yang **tidak minus**.
- Jika ada stok yang modalnya lebih tinggi dari harga jual hari ini, sistem memberi status **HOLD / Jangan Jual Dulu**.
- Harga harian menyimpan minimal 3 harga:
  - Harga jual umum.
  - Harga reseller.
  - Harga buyback.
- Invoice/nota bisa dibuat dari transaksi dan bisa dicetak/PDF/screenshot.
- Laporan harus mudah dibaca oleh owner, bukan format akuntansi yang rumit.

## 4. MVP Scope Final

Agar aplikasi cepat jadi dan tetap sesuai kebutuhan Yuk Lili, MVP dibatasi menjadi 3 fitur inti.

### MVP Feature 1 — Produk + Stok Detail Modal

**Prioritas:** MVP

#### Deskripsi
Admin bisa input daftar produk emas/perak, lalu mencatat stok masuk berdasarkan harga modal. Sistem menyimpan detail modal secara otomatis walaupun tampilan ke user tetap sederhana.

#### Produk awal yang perlu didukung
- Emas Antam
- Emas Rahafa / Retro
- MiniGold
- MicroGold
- Silverium / perak reguler
- Dirham
- Rupiya
- Limited Edition
- Palestine
- Asmaul Husna

#### Data produk
- Nama produk
- Kategori: emas / perak
- Jenis/model
- Gramasi
- Satuan: gram / D / R / pcs
- Status aktif/nonaktif

#### Data stok masuk
- Tanggal masuk
- Sumber stok:
  - Supplier/belanja
  - Buyback customer
  - Stok awal
  - Koreksi
- Produk
- Gramasi
- Jumlah pcs
- Harga modal per pcs
- Supplier/customer asal barang
- Catatan
- Status stok:
  - Ready
  - Hold
  - Sold out

#### Acceptance criteria
- Admin bisa tambah, edit, nonaktifkan produk.
- Admin bisa input stok masuk dengan modal berbeda untuk produk/gramasi yang sama.
- Sistem menampilkan stok akhir total per produk.
- Sistem bisa membuka detail modal jika owner ingin lihat rincian.
- Sistem menandai stok sebagai Hold jika modal lebih tinggi dari harga jual aktif.
- Stok tidak boleh minus.

---

### MVP Feature 2 — Harga Harian: Jual Umum, Reseller, dan Buyback

**Prioritas:** MVP

#### Deskripsi
Admin bisa update harga harian untuk setiap produk/gramasi. Harga ini dipakai otomatis saat transaksi penjualan, transaksi reseller, dan transaksi buyback.

#### Data harga harian
- Tanggal harga
- Produk
- Gramasi
- Harga jual umum
- Harga reseller
- Harga buyback
- Status:
  - Aktif
  - Draft
  - Arsip
- Catatan

#### Cara kerja update harga
1. Admin buka menu **Harga Hari Ini**.
2. Klik **Buat Harga Hari Ini**.
3. Sistem otomatis copy harga dari hari sebelumnya.
4. Admin cukup edit harga yang berubah.
5. Admin klik **Aktifkan Harga Hari Ini**.
6. Semua transaksi hari itu otomatis mengambil harga aktif terbaru.

#### Aturan harga
- Harga jual umum dipakai untuk customer biasa.
- Harga reseller dipakai untuk customer bertipe reseller.
- Harga buyback dipakai saat toko membeli kembali barang dari customer.
- Semua harga tetap bisa diubah manual saat transaksi, tetapi sistem memberi warning jika harga jual di bawah modal.
- Owner bisa set **margin minimal** agar sistem memberi peringatan jika profit terlalu tipis.

#### Acceptance criteria
- Admin bisa input/update harga harian.
- Admin bisa copy harga kemarin ke hari ini.
- Sistem menyimpan histori harga per tanggal.
- Saat buat invoice, harga otomatis mengikuti tipe customer.
- Saat buyback, harga otomatis mengambil harga buyback aktif.
- Harga bisa dioverride manual dengan catatan.

---

### MVP Feature 3 — Transaksi Penjualan, Reseller, Buyback + Invoice/Laporan

**Prioritas:** MVP

#### Deskripsi
Admin bisa mencatat transaksi keluar dan masuk: penjualan customer umum, penjualan reseller, dan buyback dari customer. Sistem otomatis mengubah stok, membuat nota/invoice, dan masuk ke laporan.

#### Jenis transaksi
1. **Penjualan Umum**
   - Customer membeli barang.
   - Stok berkurang.
   - Harga default = harga jual umum.
   - Invoice customer dibuat.

2. **Penjualan Reseller**
   - Reseller membeli barang.
   - Stok berkurang.
   - Harga default = harga reseller.
   - Sistem tetap cek agar tidak minus.
   - Invoice reseller dibuat.

3. **Buyback**
   - Customer menjual barang ke toko.
   - Uang toko keluar.
   - Stok bertambah.
   - Modal stok baru = harga buyback yang dibayarkan.
   - Nota buyback dibuat untuk arsip toko/customer.

#### Data transaksi penjualan
- Tanggal transaksi
- Nomor invoice otomatis
- Tipe customer: umum / reseller
- Nama customer
- Nomor WhatsApp customer
- Daftar item:
  - Produk
  - Gramasi
  - Qty
  - Harga jual per pcs
  - Stok detail modal yang dipakai
  - Modal per pcs
  - Profit per item
- Total belanja
- DP/bayar
- Sisa pembayaran
- Metode pembayaran
- Catatan transaksi

#### Data transaksi buyback
- Tanggal buyback
- Nomor nota buyback otomatis
- Nama customer/penjual
- Nomor WhatsApp
- Daftar item:
  - Produk
  - Gramasi
  - Qty
  - Harga buyback per pcs
  - Total buyback
  - Kondisi barang/catatan
- Total uang keluar
- Metode pembayaran
- Catatan
- Stok baru yang otomatis dibuat

#### Aturan stok dan profit
- Saat admin memilih produk untuk dijual, sistem menampilkan stok tersedia.
- Sistem memberi rekomendasi stok yang aman dijual:
  - Tidak minus.
  - Modal <= harga jual.
  - Prioritas ambil modal tertinggi yang masih tidak minus agar stok mahal cepat berkurang.
- Jika semua stok produk tersebut minus, sistem memberi peringatan:
  > "Harga jual lebih rendah dari modal. Disarankan HOLD stok ini."
- Admin tetap bisa override dengan PIN owner jika ingin tetap jual minus.
- Saat buyback, sistem otomatis menambah stok baru dengan modal sesuai harga buyback.

#### Format invoice penjualan
Header:
- Logo Rahafa
- RAHAFA
- EMAS & SILVER
- Pusat jual beli Emas & Perak Bangka Belitung
- No. Telp admin 0853-8410-9496

Isi:
- No invoice
- Tanggal
- Nama customer
- No WA
- Detail barang
- Gramasi
- Qty
- Harga satuan
- Total
- DP / Terbayar
- Sisa pembayaran
- Catatan

Output:
- Tampilan invoice mobile
- Tombol Print
- Tombol Download PDF
- Tombol Kirim ke WhatsApp customer

#### Format nota buyback
Header sama seperti invoice, tetapi judul:
- NOTA BUYBACK / PEMBELIAN KEMBALI

Isi:
- No nota buyback
- Tanggal
- Nama penjual/customer
- No WA
- Detail barang yang diterima
- Gramasi
- Qty
- Harga buyback
- Total pembayaran ke customer
- Catatan/kondisi barang

#### Laporan harian
- Total penjualan umum hari ini
- Total penjualan reseller hari ini
- Total buyback hari ini
- Total profit estimasi hari ini
- Jumlah transaksi
- Barang keluar hari ini
- Barang masuk dari buyback hari ini
- Barang masuk dari supplier hari ini
- Sisa pembayaran/piutang jika ada

#### Laporan bulanan
- Total penjualan per bulan
- Total reseller per bulan
- Total buyback per bulan
- Total profit per bulan
- Produk paling sering terjual
- Total stok masuk
- Total stok keluar
- Rekap invoice
- Rekap nota buyback

#### Laporan stok akhir
- Produk
- Gramasi
- Qty stok
- Modal per detail stok
- Nilai modal total
- Harga jual umum hari ini
- Harga reseller hari ini
- Harga buyback hari ini
- Status:
  - Aman jual umum
  - Aman reseller
  - Tipis margin
  - Hold karena minus
- Potensi profit jika dijual di harga umum/reseller

#### Acceptance criteria
- Admin bisa membuat invoice penjualan umum.
- Admin bisa membuat invoice penjualan reseller.
- Admin bisa membuat nota buyback.
- Penjualan otomatis mengurangi stok.
- Buyback otomatis menambah stok.
- Invoice/nota bisa dicetak.
- Invoice/nota bisa di-download PDF.
- Invoice/nota bisa dikirim ke WA dengan link pesan otomatis.
- Profit per transaksi tersimpan untuk laporan internal, tapi tidak tampil ke customer.
- Laporan bisa difilter berdasarkan tanggal dan jenis transaksi.

## 5. Nice-to-have Features

### 5.1 Generate Pricelist Harian
Admin bisa membuat gambar pricelist seperti yang biasa diposting.

- Bisa pilih jenis pricelist:
  - Customer umum
  - Reseller
  - Buyback
- Bisa simpan histori harga per tanggal.
- Bisa share gambar pricelist ke WhatsApp/Instagram.
- Bisa tandai harga "tetap" atau "berubah".

### 5.2 WhatsApp Semi-Otomatis
MVP cukup pakai tombol "Kirim WA" yang membuka chat WhatsApp berisi pesan invoice/nota.

Contoh invoice:
> Assalamualaikum Kak, berikut invoice pembelian di Rahafa Emas & Silver.  
> No Invoice: INV-0001  
> Total: Rp...  
> Sisa: Rp...  
> Terima kasih.

Contoh buyback:
> Assalamualaikum Kak, berikut nota buyback di Rahafa Emas & Silver.  
> No Nota: BB-0001  
> Total Pembayaran: Rp...  
> Terima kasih.

### 5.3 Dashboard Piutang / Sisa Bayar
Untuk transaksi yang belum lunas.

- Daftar customer dengan sisa pembayaran.
- Reminder jatuh tempo.
- Status lunas/belum lunas.

### 5.4 Import Data dari Excel
Untuk input stok awal, produk, dan harga harian secara massal.

### 5.5 Multi-user
Role:
- Owner: lihat semua laporan dan profit.
- Admin: input transaksi, invoice, stok, buyback.
- Kasir: transaksi saja.

## 6. Future Features

### 6.1 OCR Pricelist dari Foto
Upload gambar pricelist, sistem membaca gramasi dan harga otomatis.

Catatan: ini bukan MVP karena rawan salah baca angka. Untuk awal, input manual lebih aman.

### 6.2 WhatsApp API Otomatis
Notif WA otomatis setiap ada pembelian, invoice, reminder piutang, dan buyback.

### 6.3 Akuntansi Lanjutan
- Neraca stok
- Cashflow
- Expense toko
- Rekap supplier
- Margin per kategori
- Rekap uang keluar untuk buyback

### 6.4 Multi-cabang
Jika Rahafa membuka cabang/titik penjualan lain.

## 7. Pages & UI

### 7.1 Login Page
Isi:
- Logo Rahafa
- Nomor WhatsApp sebagai username
- PIN/password
- Tombol login
- Helper text: "Masukkan nomor WhatsApp admin Rahafa"
- Validasi format nomor: boleh input 0853..., 62853..., atau +62853..., sistem normalisasi ke format 62...

### 7.2 Dashboard
Isi:
- Penjualan hari ini
- Penjualan reseller hari ini
- Buyback hari ini
- Profit estimasi hari ini
- Transaksi hari ini
- Stok yang perlu Hold
- Tombol cepat:
  - Barang Masuk
  - Update Harga Hari Ini
  - Buat Invoice
  - Buyback
  - Lihat Stok
  - Laporan

### 7.3 Produk
Isi:
- Daftar produk
- Filter kategori: emas/perak
- Filter gramasi
- Tombol tambah produk
- Edit/nonaktifkan produk

### 7.4 Harga Hari Ini
Isi:
- Pilih tanggal
- Tombol copy harga kemarin
- Tabel produk/gramasi
- Input harga jual umum
- Input harga reseller
- Input harga buyback
- Tombol simpan draft
- Tombol aktifkan harga hari ini

### 7.5 Barang Masuk
Isi:
- Form input stok masuk dari supplier/stok awal/koreksi
- Produk
- Gramasi
- Qty
- Harga modal
- Tanggal
- Catatan
- Riwayat barang masuk

### 7.6 Stok Akhir
Isi:
- Tabel stok per produk
- Detail stok modal
- Modal
- Harga jual umum hari ini
- Harga reseller hari ini
- Harga buyback hari ini
- Status aman/hold
- Search produk
- Filter kategori

### 7.7 Buat Penjualan / Invoice
Isi:
- Tipe transaksi: penjualan umum / reseller
- Data customer
- Pilih produk
- Pilih qty
- Harga otomatis berdasarkan tipe customer
- Override harga manual
- Rekomendasi stok aman
- Total otomatis
- DP/bayar
- Sisa
- Tombol simpan & buat invoice

### 7.8 Buyback
Isi:
- Data customer/penjual
- Pilih produk
- Pilih qty
- Harga buyback otomatis dari harga aktif
- Override harga manual
- Total pembayaran ke customer
- Catatan kondisi barang
- Tombol simpan & buat nota buyback

### 7.9 Detail Invoice / Nota
Isi:
- Tampilan invoice/nota seperti nota
- Tombol Print
- Tombol Download PDF
- Tombol Kirim WA
- Tombol Edit jika belum final

### 7.10 Laporan
Isi:
- Filter tanggal
- Filter jenis transaksi: semua / penjualan umum / reseller / buyback
- Laporan harian
- Laporan bulanan
- Export PDF/CSV
- Rekap invoice
- Rekap nota buyback
- Rekap profit

### 7.11 Settings
Isi:
- Logo toko
- Nama toko
- Alamat/keterangan
- Nomor admin
- Template invoice
- Template nota buyback
- Prefix invoice
- Prefix nota buyback
- Margin minimal
- Role user

## 8. User Flow Utama

### Flow 1 — Input stok masuk dari supplier
1. Admin login.
2. Buka Barang Masuk.
3. Pilih produk dan gramasi.
4. Input qty dan harga modal.
5. Simpan.
6. Sistem menambah stok sebagai detail modal baru.

### Flow 2 — Update harga hari ini
1. Admin buka Harga Hari Ini.
2. Klik Copy dari Harga Kemarin.
3. Edit harga jual umum, reseller, dan buyback yang berubah.
4. Klik Aktifkan Harga Hari Ini.
5. Sistem memakai harga ini untuk transaksi hari itu.

### Flow 3 — Jual barang dan buat invoice
1. Admin buka Buat Invoice.
2. Pilih tipe customer: umum atau reseller.
3. Input customer.
4. Pilih produk.
5. Sistem isi harga otomatis berdasarkan tipe customer.
6. Sistem cek stok detail modal.
7. Sistem rekomendasikan stok aman.
8. Admin simpan transaksi.
9. Sistem mengurangi stok.
10. Invoice dibuat.
11. Admin print/PDF/kirim WA.

### Flow 4 — Terima buyback dari customer
1. Admin buka Buyback.
2. Input nama dan WA customer/penjual.
3. Pilih produk dan gramasi.
4. Sistem isi harga buyback aktif.
5. Admin isi qty dan catatan kondisi.
6. Simpan transaksi buyback.
7. Sistem mencatat uang keluar.
8. Sistem menambah stok baru dengan modal = harga buyback.
9. Nota buyback dibuat.

### Flow 5 — Cek stok yang harus di-hold
1. Owner buka Stok Akhir.
2. Sistem bandingkan modal detail stok dengan harga jual umum/reseller hari ini.
3. Stok yang modal > harga jual diberi status Hold.
4. Owner tahu barang mana yang jangan dijual dulu.

### Flow 6 — Laporan akhir bulan
1. Owner buka Laporan.
2. Pilih rentang tanggal bulan berjalan.
3. Lihat total penjualan, reseller, buyback, profit, stok masuk/keluar.
4. Export PDF/CSV.
5. Cocokkan dengan invoice/faktur manual jika masih digunakan.

## 9. Validasi Rules

### Produk
- Nama produk wajib.
- Kategori wajib: emas/perak.
- Gramasi wajib angka positif.
- Produk aktif tidak boleh dihapus jika sudah punya transaksi; hanya bisa dinonaktifkan.

### Harga harian
- Tanggal wajib.
- Produk wajib.
- Minimal salah satu harga diisi: jual umum/reseller/buyback.
- Harga tidak boleh negatif.
- Hanya satu harga aktif per produk per tanggal.
- Jika harga reseller > harga jual umum, tampilkan warning.
- Jika harga buyback > harga jual umum, tampilkan warning.

### Barang masuk
- Qty wajib > 0.
- Harga modal wajib > 0.
- Tanggal wajib.
- Produk wajib ada.

### Penjualan
- Customer boleh kosong untuk transaksi cepat, tapi disarankan isi nama.
- Tipe customer wajib: umum/reseller.
- Qty tidak boleh melebihi stok.
- Harga jual wajib > 0.
- Jika harga jual < modal stok, tampilkan warning.
- Override jual minus hanya untuk owner/PIN.
- Jika harga reseller membuat margin terlalu tipis, tampilkan warning.

### Buyback
- Nama customer/penjual disarankan diisi.
- Produk wajib.
- Qty wajib > 0.
- Harga buyback wajib > 0.
- Setelah final, buyback otomatis menambah stok.
- Jika nota buyback dibatalkan, stok dari buyback tersebut harus dikurangi/dibatalkan juga.

### Invoice/Nota
- Nomor invoice unik.
- Nomor nota buyback unik.
- Transaksi final tidak boleh dihapus; hanya bisa dibatalkan dengan alasan.
- Invoice batal mengembalikan stok.
- Nota buyback batal membatalkan stok masuk dari buyback.

### Laporan
- Filter tanggal wajib valid.
- Export harus sesuai data yang tampil di layar.

## 10. Edge Cases

### 10.1 Validasi Login WhatsApp
- Nomor WhatsApp wajib diisi.
- Sistem menerima format 0853..., 62853..., atau +62853....
- Sistem menyimpan nomor dalam format normal 62xxxxxxxxxx.
- PIN/password wajib diisi.
- Jika nomor tidak terdaftar, tampilkan pesan login gagal yang aman.
- Jika user tidak aktif, tolak login.
- Jangan tampilkan apakah nomor atau PIN yang salah secara spesifik.


1. Produk sama, gramasi sama, modal berbeda.
   - Simpan sebagai detail modal berbeda.

2. Harga pasar turun di bawah modal.
   - Stok diberi status Hold.

3. Harga reseller lebih rendah dari sebagian modal.
   - Sistem rekomendasikan stok yang masih aman.
   - Jika tidak ada, tampilkan warning Hold.

4. Admin buyback barang lalu langsung dijual di hari yang sama.
   - Sistem bisa karena buyback otomatis menambah stok baru.

5. Admin salah input buyback.
   - Jika belum final, bisa edit.
   - Jika sudah final, batalkan nota buyback dengan alasan.

6. Customer bayar sebagian.
   - Simpan DP dan sisa pembayaran.

7. Stok tidak cukup.
   - Blok transaksi, tampilkan stok tersedia.

8. Internet lambat.
   - Tampilkan loading dan jangan double-submit.

9. Admin klik submit berkali-kali.
   - Disable tombol saat proses.

10. Data invoice/nota perlu dicetak.
   - Layout print harus bersih dan tidak ikut mencetak tombol UI.

## 11. Data Model Awal

### users
- id
- name
- whatsapp_number
- whatsapp_number_normalized
- pin_hash atau password_hash
- role: owner/admin/kasir
- is_active
- last_login_at
- created_at
- updated_at

Catatan auth:
- Login tidak memakai email.
- Username utama adalah nomor WhatsApp.
- Untuk MVP gunakan login nomor WhatsApp + PIN/password internal.
- OTP WhatsApp otomatis masuk Future karena butuh integrasi WhatsApp Business API/provider OTP.
- Semua nomor WhatsApp harus dinormalisasi agar 0853..., 62853..., dan +62853... dikenali sebagai nomor yang sama.

### products
- id
- name
- category: gold/silver
- type
- weight
- unit
- is_active
- created_at
- updated_at

### customers
- id
- name
- phone
- address
- customer_type: general/reseller
- notes
- created_at
- updated_at

### stock_batches
Nama di database boleh tetap stock_batches, tapi di UI sebut sebagai "Detail Modal Stok".

- id
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
- created_at
- updated_at

### daily_prices
- id
- product_id
- date
- retail_sell_price
- reseller_sell_price
- buyback_price
- status: draft/active/archived
- notes
- created_at
- updated_at

### transactions
- id
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
- created_at
- updated_at

### transaction_items
- id
- transaction_id
- product_id
- stock_batch_id
- quantity
- unit_price
- cost_price
- profit
- notes
- created_at

Catatan:
- Untuk penjualan, stock_batch_id wajib karena stok keluar harus tahu modalnya.
- Untuk buyback, stock_batch_id boleh diisi setelah sistem membuat stok baru dari transaksi buyback.

### settings
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

## 12. Recommended Tech Stack

### MVP Stack
- Frontend: Next.js
- Styling: Tailwind CSS + shadcn/ui
- Database/Storage: Supabase
- Auth MVP: custom login nomor WhatsApp + PIN/password
- PDF/Print: Browser print CSS + PDF export
- Hosting: Vercel
- File storage: Supabase Storage untuk logo
- WhatsApp: wa.me link generator untuk MVP

### Kenapa stack ini
- Cepat dibangun dengan AI agent.
- Responsive untuk HP/tablet/desktop.
- Supabase cukup untuk database dan storage; auth MVP dibuat custom dengan nomor WhatsApp + PIN/password agar tidak bergantung pada email.
- Invoice/nota print/PDF bisa dibuat tanpa integrasi berat.
- WhatsApp bisa semi-otomatis dulu tanpa API.

## 13. Roadmap

### v1.0 MVP
Target: aplikasi bisa dipakai untuk operasional dasar.

Fitur:
- Produk & stok detail modal
- Harga harian: umum, reseller, buyback
- Barang masuk
- Penjualan umum + invoice print/PDF
- Penjualan reseller + invoice print/PDF
- Buyback + nota buyback print/PDF
- Laporan harian/bulanan/stok akhir
- Dashboard sederhana
- Settings invoice/nota

### v1.1
Target: membuat penggunaan harian makin cepat.

Fitur:
- Generate pricelist harian untuk umum/reseller/buyback
- Template pesan WA
- Export Excel/CSV
- Dashboard stok hold
- Piutang/sisa pembayaran

### v1.2
Target: mengurangi input manual.

Fitur:
- Import stok awal dari Excel
- Import harga harian dari Excel
- Generate gambar pricelist
- Role user owner/admin/kasir
- Backup data

### v2.0
Target: otomatisasi dan scale.

Fitur:
- WhatsApp API otomatis
- OCR pricelist dari gambar
- Multi-cabang
- Akuntansi lanjutan
- Analisis margin dan rekomendasi restock

## 14. MVP Scope yang Disarankan untuk Ditawarkan ke Yuk Lili

Paket MVP awal jangan terlalu besar. Fokuskan ke 3 hal:

1. **Stok detail per modal**
   - Supaya tahu barang mana yang aman jual dan mana yang harus hold.

2. **Harga harian + transaksi lengkap**
   - Harga umum, reseller, dan buyback.
   - Jual umum, jual reseller, dan buyback.

3. **Invoice/nota + laporan**
   - Invoice penjualan bisa print/PDF.
   - Nota buyback bisa print/PDF.
   - Laporan harian/bulanan untuk cocokkan penjualan, buyback, stok, dan sisa pembayaran.

Yang sengaja ditunda:
- OCR foto pricelist
- WA API otomatis penuh
- Akuntansi kompleks
- Multi-cabang
- Integrasi mesin kasir/printer khusus

## 15. Pitch Message untuk Yuk Lili

Yuk, dari kebutuhan yang ayuk jelaskan, aplikasinya paling pas bukan sekadar kasir biasa.

Karena bisnis emas/perak punya harga modal, harga jual, harga reseller, dan harga buyback yang berubah setiap hari, sistemnya perlu bisa mencatat stok berdasarkan harga modal. Jadi kalau ada emas 1gr modal Rp2.000.000 dan ada juga 1gr modal Rp2.100.000, saat dijual sistem bisa bantu pilih stok yang aman supaya tidak minus. Kalau modal lebih tinggi dari harga pasar hari itu, sistem tandai barang itu sebagai hold.

Untuk tahap awal, kita buat 3 fungsi utama dulu:

1. Catat stok masuk dan stok akhir detail per modal.
2. Update harga harian untuk harga umum, reseller, dan buyback.
3. Buat transaksi penjualan, transaksi reseller, buyback, invoice, nota, dan laporan harian/bulanan.

Aplikasi dibuat mobile-friendly, jadi bisa dipakai dari HP atau tablet. Invoice dan nota bisa diprint/PDF, jadi pencocokan akhir bulan lebih rapi dan tidak bergantung pada faktur manual yang rawan hilang.


---

## Appendix A — Master Produk Rahafa Berdasarkan Data Barang 24 Juni 2026

Data ini menjadi seed awal produk Rahafa. Kolom `harga_jual_umum_awal` dipakai untuk mengisi draft harga pertama di menu Harga Hari Ini, bukan sebagai harga modal stok.

| Kode Barang | Kode Sistem | Nama Barang | Kategori | Jenis/Model | Gramasi | Satuan | Harga Jual Umum Awal |
|---|---|---|---|---|---:|---|---:|
| A05 | A05 | ANTAM 0.5 Gram | Emas | ANTAM | 0.5 | gram | 1,566,000 |
| A1 | A1 | ANTAM 1 Gram | Emas | ANTAM | 1 | gram | 2,852,000 |
| A2 | A2 | ANTAM 2 Gram | Emas | ANTAM | 2 | gram | 5,554,000 |
| A3 | A3 | ANTAM 3 Gram | Emas | ANTAM | 3 | gram | 8,251,000 |
| A5 | A5 | ANTAM 5 Gram | Emas | ANTAM | 5 | gram | 13,285,000 |
| A10 | A10 | ANTAM 10 Gram | Emas | ANTAM | 10 | gram | 26,270,000 |
| A25 | A25 | ANTAM 25 Gram | Emas | ANTAM | 25 | gram | 65,375,000 |
| A50 | A50 | ANTAM 50 Gram | Emas | ANTAM | 50 | gram | 130,850,000 |
| A100 | A100 | ANTAM 100 Gram | Emas | ANTAM | 100 | gram | 261,200,000 |
| R05 | R05 | RETRO ANTAM 0.5 GRAM | Emas | RETRO ANTAM | 0.5 | gram | 1,565,000 |
| R1 | R1 | RETRO ANTAM 1 GRAM | Emas | RETRO ANTAM | 1 | gram | 2,746,000 |
| R2 | R2 | RETRO ANTAM 2 GRAM | Emas | RETRO ANTAM | 2 | gram | 5,412,000 |
| R2,5 | R2_5 | RETRO ANTAM 2,5 GRAM | Emas | RETRO ANTAM | 2.5 | gram | 6,871,000 |
| R3 | R3 | RETRO ANTAM 3 GRAM | Emas | RETRO ANTAM | 3 | gram | 8,183,000 |
| R5 | R5 | RETRO ANTAM 5 GRAM | Emas | RETRO ANTAM | 5 | gram | 13,330,000 |
| R10 | R10 | RETRO ANTAM 10 GRAM | Emas | RETRO ANTAM | 10 | gram | 26,760,000 |
| RG0025 | RG0025 | MINIGOLD REGULER 0.025 | Emas | MINIGOLD REGULER | 0.025 | gram | 73,000 |
| RG005 | RG005 | MINIGOLD REGULER 0.05 | Emas | MINIGOLD REGULER | 0.05 | gram | 136,000 |
| RG01 | RG01 | MINIGOLD REGULER 0.1 | Emas | MINIGOLD REGULER | 0.1 | gram | 265,000 |
| RG025 | RG025 | MINIGOLD REGULER 0.25 | Emas | MINIGOLD REGULER | 0.25 | gram | 658,000 |
| RG05 | RG05 | MINIGOLD REGULER 0.5 | Emas | MINIGOLD REGULER | 0.5 | gram | 1,272,000 |
| RG1 | RG1 | MINIGOLD REGULER 1 | Emas | MINIGOLD REGULER | 1 | gram | 2,526,000 |
| RG15 | RG15 | MINIGOLD REGULER 1.5 | Emas | MINIGOLD REGULER | 1.5 | gram | 3,747,000 |
| M01 | M01 | MICRO GOLD 0.1 | Emas | MICRO GOLD | 0.1 | gram | 408,000 |
| M025 | M025 | MICRO GOLD 0.25 | Emas | MICRO GOLD | 0.25 | gram | 844,000 |
| S3,3 | S3_3 | SILVERIUM REGULER 3,3 GRAM | Perak | SILVERIUM REGULER | 3.3 | gram | 185,000 |
| S9,9 | S9_9 | SILVERIUM REGULER 9,9 GRAM | Perak | SILVERIUM REGULER | 9.9 | gram | 547,000 |
| S33 | S33 | SILVERIUM REGULER 33 GRAM | Perak | SILVERIUM REGULER | 33 | gram | 1,762,000 |
| S50 | S50 | SILVERIUM REGULER 50 GRAM | Perak | SILVERIUM REGULER | 50 | gram | 2,700,000 |
| S99 | S99 | SILVERIUM REGULER 99 GRAM | Perak | SILVERIUM REGULER | 99 | gram | 5,258,000 |
| S250 | S250 | SILVERIUM REGULER 250 GRAM | Perak | SILVERIUM REGULER | 250 | gram | 12,985,000 |
| S500 | S500 | SILVERIUM REGULER 500 GRAM | Perak | SILVERIUM REGULER | 500 | gram | 25,295,000 |
| D1 | D1 | 1 DIRHAM ABA | Perak | DIRHAM ABA | 3.11 | dirham | 184,000 |
| D5 | D5 | 5 DIRHAM ABA | Perak | DIRHAM ABA | 15.55 | dirham | 879,000 |
| RP1 | RP1 | 1 RUPIYA | Perak | RUPIYA | 3.11 | rupiya | 156,000 |
| RP5 | RP5 | 5 RUPIYA | Perak | RUPIYA | 15.55 | rupiya | 754,000 |
| S5 IDUL FITRI | S5_IDUL_FITRI | SILVERIUM IDUL FITRI 5 GR | Perak | SILVERIUM IDUL FITRI | 5 | gram | 322,000 |
| S25 IDUL FITRI | S25_IDUL_FITRI | SILVERIUM LIMITED EDITION 25 GR | Perak | SILVERIUM LIMITED EDITION | 25 | gram | 1,417,000 |
| S50 IDUL FITRI | S50_IDUL_FITRI | SILVERIUM LIMITED EDITION 50 GR | Perak | SILVERIUM LIMITED EDITION | 50 | gram | 2,822,000 |
| S100 IDUL FITRI | S100_IDUL_FITRI | SILVERIUM LIMITED EDITION 100 GR | Perak | SILVERIUM LIMITED EDITION | 100 | gram | 5,484,000 |
| SP | SP | SILVERIUM PALESTINE 31.1 GRAM | Perak | SILVERIUM PALESTINE | 31.1 | gram | 1,858,000 |
| SAH99 | SAH99 | SILVERIUM ASMAUL HUSNA 99 GRAM | Perak | SILVERIUM ASMAUL HUSNA | 99 | gram | 5,258,000 |

### Catatan Implementasi Produk
- `Kode Barang` mengikuti kode bisnis Rahafa yang biasa dipakai admin.
- `Kode Sistem` dipakai untuk kebutuhan database/import agar aman dari karakter koma/spasi.
- Produk dengan satuan `dirham` dan `rupiya` tetap disimpan dengan gramasi estimasi 3.11g untuk 1D/1R dan 15.55g untuk 5D/5R.
- Harga reseller dan buyback tidak di-hardcode di master produk. Keduanya masuk ke tabel `daily_prices` supaya bisa berubah setiap hari.
- Harga modal stok tidak boleh diambil dari master produk. Modal hanya berasal dari `Barang Masuk` atau `Buyback`.
