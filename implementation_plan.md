# Pembaruan UI/UX: Desain Elegan, Profesional, dan Modern

Permintaan pembaruan visual ini bertujuan untuk mengubah tampilan standar (bawaan) menjadi antarmuka yang bernuansa premium, elegan, dan *easy on the eyes* (nyaman dipandang) namun tetap fungsional sebagai aplikasi kasir/manajemen stok Rahafa Gold.

## User Review Required

> [!IMPORTANT]
> Harap setujui rencana desain di bawah ini sebelum saya mulai mengubah kode. Jika Anda memiliki preferensi warna (misalnya ingin lebih dominan warna Gold, Putih, atau Gelap), silakan sampaikan sekarang.

## Open Questions

- Apakah Anda setuju dengan penggunaan *font* **Plus Jakarta Sans** (bersih, bulat, modern)?
- Apakah Anda setuju dengan skema warna **Deep Slate (Hitam Kebiruan Elegan)** dipadukan dengan aksen **Gold/Amber** untuk menyelaraskan dengan identitas "Rahafa Gold"?

## Proposed Changes

### [Tema Global & Font]
Pembaruan variabel warna dan tipografi di seluruh aplikasi.

#### [MODIFY] globals.css
- Mengubah skema warna (menggunakan format `oklch` Tailwind v4).
- `primary`: Warna *Deep Slate / Charcoal* (Hitam kebiruan yang elegan, tidak terlalu pekat).
- `secondary` / `accent`: Warna *Soft Gold / Amber* sebagai aksen premium.
- `background`: *Off-white* / krem sangat muda agar tidak menyilaukan mata (easy on the eyes).
- `radius`: Diperbesar dari `0.5rem` menjadi `0.75rem` atau `1rem` agar kartu dan tombol terlihat lebih modern (membulat lembut/rounded).
- Menambahkan kelas utilitas seperti `.glass-panel` untuk efek *glassmorphism* tipis.

#### [MODIFY] src/app/layout.tsx
- Mengganti *font* bawaan (Geist) menjadi **Plus Jakarta Sans**. Font ini banyak digunakan di aplikasi *fintech* dan premium karena sangat mudah dibaca (*legible*) dan memberikan kesan profesional.
- Mengubah `title` aplikasi menjadi "Rahafa Gold - Manajemen & Kasir".

### [Pembaruan Komponen Utama]
Menghilangkan pewarnaan statis (`blue-50`, `indigo-50`) yang terkesan seperti aplikasi stok biasa, menggantinya dengan desain bernuansa mewah.

#### [MODIFY] src/components/app-sidebar.tsx
- Memberikan efek *subtle border* dan menghilangkan latar belakang putih pekat agar menyatu elegan dengan *background*.

#### [MODIFY] src/components/dashboard/dashboard-client.tsx
- Mengganti *card* statistik dengan efek gradien tipis (misal: *slate* ke *gold* sangat pudar).
- Mengganti gaya tabel *Recent Transactions* agar menggunakan spasi yang lebih lega dan pemisah garis yang sangat tipis (*hairline borders*).

#### [MODIFY] src/components/stok/stok-client.tsx & stock-detail-card.tsx
- Memperhalus tampilan lencana (*badge*) status "Aman" dan "Hold/Margin Tipis".
- Menyempurnakan tipografi untuk menyorot angka modal dan harga dengan kontras warna yang lebih baik.

#### [MODIFY] src/components/invoice/invoice-client.tsx
- Memperindah kotak input pencarian dan keranjang.
- Menggunakan *soft shadows* pada tombol Checkout.

## Verification Plan

### Automated Tests
- Menjalankan `npm run build` untuk memastikan tidak ada konflik kelas Tailwind atau *font loader*.

### Manual Verification
- Navigasi melalui Dasbor, Stok, dan Laporan.
- Memastikan teks tetap terbaca dengan baik (*high contrast* di tempat yang tepat).
- Menguji *responsiveness* (tampilan HP) untuk memastikan desain baru tidak merusak tata letak *mobile*.
