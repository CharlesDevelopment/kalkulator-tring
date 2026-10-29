# DESIGN.md: Tring! Cuan Analyzer (Kalkulator Cuan Emas Tring! by Pegadaian)

## Design Read
Reading this as: Aplikasi web meja hitung (bullion desk calculator) untuk mengaudit selisih harga beli, potongan voucher, biaya admin multi-VA, dan hasil buyback emas Tring! by Pegadaian, dengan identitas Hijau Zamrud & Emas Murni serta angka tabular presisi tinggi, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

## Identitas & Karakter Produk
- **Produk**: Tring! Cuan Analyzer, kalkulator audit buyback emas untuk pengguna aplikasi Tring! by Pegadaian yang memecah transaksi menggunakan voucher dan berbagai metode Virtual Account (VA BCA maupun VA Bank Lain).
- **Kepribadian**: Terukur, transparan, presisi hingga empat desimal gram (`0,0001 g`) dan satuan Rupiah penuh, bebas klaim bombastis.
- **Dial Liveliness**:
  - **ENERGY: 2 (Balanced)**: Hirarki kontras tinggi antara kartu hasil utama (Net Cuan / Rugi) dan lembar kerja input parameter.
  - **RHYTHM: 2 (Consistent with intentional breaks)**: Pita pemantau harga emas Pegadaian (PriceCard) membentang penuh di bagian atas, diikuti tata letak dua kolom asimetris (7 kolom untuk formulir transaksi & rincian VA di kiri, 5 kolom untuk struk ringkasan hasil & spread bar yang menempel/sticky di kanan pada layar lebar, serta 2 kolom terstruktur pada tablet).
  - **MOTION: 1 (Hover & focus states only)**: Perubahan status fokus dan hover yang instan tanpa animasi berulang atau efek mengambang, menjaga kecepatan input multi-transaksi.

## Palet Warna (Maksimal 3 Warna Inti + 1 Aksen)
Seluruh pasangan warna telah diverifikasi memenuhi standar kontras WCAG AA (minimal 4.5:1 untuk teks normal, 3.0:1 untuk teks besar dan batas komponen interaktif).

### Tema Terang (Default: Pegadaian Bullion Ledger Light)
- **Inti 1 (Latar Utama)**: `#F4F6F4` (Alabaster Mint, memberikan kesan kertas buku kas bersih)
- **Inti 2 (Permukaan Kartu & Tabel)**: `#FFFFFF` (Pure Sheet) dengan garis batas kartu `#CBD5CE` dan garis batas input/kontrol `#64746B` (rasio > 4.6:1 di atas `#FFFFFF`)
- **Inti 3 (Teks Utama & Sekunder)**:
  - Teks Utama: `#0F1E16` (Deep Forest Ink, rasio 16.8:1 di atas `#FFFFFF`, 15.6:1 di atas `#F4F6F4`)
  - Teks Sekunder: `#3D5245` (Slate Pine, rasio 8.2:1 di atas `#FFFFFF`, 7.6:1 di atas `#F4F6F4`)
- **Aksen Tunggal (Tring! Emerald & Gold Bullion)**:
  - Aksen Utama (Tombol & Indikator Aktif): `#005E38` (Pegadaian Deep Emerald) dengan teks `#FFFFFF` (rasio 8.1:1)
  - Sorotan Logam Mulia (Badge Gramasi & Garis Aksen): `#8C5E00` di atas latar `#FFF8E6` dengan batas `#D99B26` (rasio teks 5.8:1)
- **Warna Semantik Status Cuan**:
  - Untung (Net Cuan >= 0): Teks `#0B4F28` di atas latar `#DCFCE7` dengan batas `#22C55E` (rasio teks 9.4:1)
  - Rugi (Net Cuan < 0): Teks `#7F1D1D` di atas latar `#FEE2E2` dengan batas `#EF4444` (rasio teks 8.9:1)
  - Status Override Manual / Peringatan: Teks `#6B4200` di atas latar `#FEF3C7` dengan batas `#D97706` (rasio teks 7.8:1)

### Tema Gelap (Emerald Vault Dark)
- **Inti 1 (Latar Utama)**: `#0A110E` (Deep Vault Obsidian)
- **Inti 2 (Permukaan Kartu & Tabel)**: `#111C17` (Dark Pine Surface) dengan garis batas kartu `#24382E` dan garis batas kontrol `#5E8572` (rasio 4.22:1 di atas `#111C17`)
- **Inti 3 (Teks Utama & Sekunder)**:
  - Teks Utama: `#ECF3EF` (Crisp Mint White, rasio 16.4:1 di atas `#0A110E`, 14.5:1 di atas `#111C17`)
  - Teks Sekunder: `#9BB5A6` (Muted Sage, rasio 8.4:1 di atas `#0A110E`, 7.4:1 di atas `#111C17`)
- **Aksen Tunggal (Bullion Gold & Emerald)**:
  - Aksen Utama (Tombol & Indikator Aktif): `#F2B830` (Bullion Gold) dengan teks `#0A110E` (rasio 11.2:1)
- **Warna Semantik Status Cuan**:
  - Untung (Net Cuan >= 0): Teks `#6EE7B7` di atas latar `#092A1C` dengan batas `#10B981` (rasio teks 10.6:1)
  - Rugi (Net Cuan < 0): Teks `#FCA5A5` di atas latar `#2C1215` dengan batas `#EF4444` (rasio teks 9.1:1)
  - Status Override Manual / Peringatan: Teks `#FDE047` di atas latar `#291F07` dengan batas `#EAB308` (rasio teks 11.8:1)

## Tipografi (R-06)
- **Huruf Antarmuka (Sans)**: `Plus Jakarta Sans` dipilih karena keterbacaan tinggi pada istilah perbankan dan transaksi Indonesia (seperti "Potongan Voucher", "Biaya Admin VA", "Harga Buyback").
- **Huruf Angka & Kalkulasi (Mono)**: `JetBrains Mono` dengan `font-variant-numeric: tabular-nums` digunakan khusus pada nominal Rupiah, berat gram, persentase ROI, dan rumus perhitungan agar digit angka sejajar vertikal dan mudah diaudit.

## Motif Identitas (Identity Motif)
- **Pita Audit Selisih Spread & Voucher (Break-Even Spread Bar)**: Setiap hasil kalkulasi menampilkan visualisasi proporsi antara Pengeluaran Bersih (Net Modal) dan Nilai Jual Buyback, beserta angka titik impas (break-even voucher minimal) yang dibutuhkan untuk menutup spread harga beli dan buyback Pegadaian ditambah biaya admin VA.

## Alasan Satu Baris untuk Setiap Keputusan Utama (R-31)
- **Mengapa palet ini**: Kombinasi Hijau Zamrud (`#005E38`) dan Emas Batangan (`#F2B830`) merepresentasikan identitas ekosistem tabungan emas Pegadaian sekaligus menjaga kontras baca di atas standar WCAG AA pada mode terang maupun gelap.
- **Mengapa tata letak ini**: Panel harga ditempatkan di bagian atas sebagai fondasi acuan kurs, diikuti kolom kiri untuk skenario input/multi-VA dan kolom kanan untuk kartu hasil audit agar perubahan baris VA langsung terlihat dampaknya pada Net Cuan tanpa menggulir layar.
- **Mengapa tipografi ini**: `Plus Jakarta Sans` menjaga kejelasan label formulir berbahasa Indonesia, sedangkan `JetBrains Mono` memastikan angka ribuan Rupiah dan empat desimal gram sejajar presisi.
- **Mengapa spasi ini**: Skala spasi responsif (padding 16px di ponsel, 20px di tablet, 24px di desktop) menjaga kepadatan informasi finansial tetap lega tanpa membuat halaman terasa kosong.
- **Mengapa menggunakan kartu**: Kartu hanya digunakan untuk memisahkan 3 modul fungsional yang berbeda (Panel Kurs Harga Emas, Formulir Transaksi & Multi-VA, serta Kartu Ringkasan Audit Cuan), bukan sebagai dekorasi berulang.
- **Mengapa menggunakan ikon ini**: Ikon dipilih secara fungsional untuk menandai status koneksi harga, aksi tambah/hapus baris transaksi VA, salin rincian perhitungan, dan pengalih tema terang/gelap sehingga status tidak pernah bergantung pada warna semata.
