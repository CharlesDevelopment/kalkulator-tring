# Tring! Cuan Analyzer (Kalkulator Cuan Emas Tring! by Pegadaian)

Aplikasi web kalkulator untuk menghitung selisih harga beli, potongan voucher promo, biaya admin multi-transaksi Virtual Account (VA BCA & VA Bank Lain), serta nilai jual kembali (buyback) emas pada ekosistem **Tring! by Pegadaian**.

## Fitur Utama

1. **Realtime Price Tracking & Manual Override (`app/api/price/route.ts` & `PriceCard.tsx`)**
   - Mengambil data Harga Beli dan Harga Jual (Buyback) emas per gram dari endpoint Pegadaian disertai indikator status koneksi dan timestamp update terakhir (WIB).
   - Menyediakan mode **Ubah Harga Manual** apabila server eksternal mengalami timeout atau pengguna ingin menguji kurs spesifik dari aplikasi Tring!.
2. **Form Input Transaksi Fleksibel (`CalculatorForm.tsx`)**
   - Mendukung input berdasarkan **Nominal Modal (Rp)** maupun **Berat Emas (Gram)** dengan konversi dua arah otomatis.
   - Input potongan voucher/cashback disertai tombol nominal cepat dan perhitungan persentase diskon efektif.
3. **Multi-Transaksi Pembayaran Virtual Account (`PaymentBreakdown.tsx`)**
   - Pengguna dapat menambah, mengubah, atau menghapus beberapa baris metode pembayaran sekaligus.
   - **VA BCA**: Biaya tetap `Rp0` per transaksi.
   - **VA Bank Lain (BRI, Mandiri, BNI, dll.)**: Biaya `+Rp2.500` per transaksi.
   - Contoh otomatis: `2x VA BCA + 3x VA BRI` = `(2 x Rp0) + (3 x Rp2.500) = Rp7.500`.
4. **Struk Audit Cuan & ROI (`ResultSummary.tsx`)**
   - Menampilkan kartu kinerja **Positif Cuan (Hijau)** atau **Negatif / Rugi (Merah)** lengkap dengan ikon status, nilai bersih Rupiah, persentase ROI, serta titik impas (break-even) voucher minimal.
   - Fitur **Salin Struk** satu klik untuk membagikan rincian perhitungan ke clipboard.

## Struktur Folder

```text
kalkulator-tring/
├── app/
│   ├── api/
│   │   └── price/
│   │       └── route.ts            # Endpoint API pengambil harga emas Pegadaian
│   ├── components/
│   │   ├── ui/                     # Komponen dasar Radix UI / Tailwind (Button, Card, Input, Label)
│   │   ├── CalculatorForm.tsx      # Form input modal/gram dan potongan voucher
│   │   ├── PaymentBreakdown.tsx    # Modul multi-transaksi biaya admin VA
│   │   ├── PriceCard.tsx           # Kartu kurs emas live & override manual
│   │   └── ResultSummary.tsx       # Kartu ringkasan cuan, ROI, dan pita perbandingan spread
│   ├── lib/
│   │   ├── __tests__/              # Unit test algoritma kalkulasi (Vitest)
│   │   ├── calculator.ts           # Mesin kalkulasi emas, multi-VA, dan ROI
│   │   ├── format.ts               # Formatter Rupiah, gram 4 desimal, dan waktu WIB
│   │   └── utils.ts                # Helper class Tailwind
│   ├── globals.css                 # Variabel tema terang/gelap berstandar WCAG AA
│   ├── layout.tsx                  # Root layout dengan font Plus Jakarta Sans & JetBrains Mono
│   └── page.tsx                    # Halaman utama aplikasi
├── .env.example                    # Contoh konfigurasi environment variabel
├── DESIGN.md                       # Spesifikasi arah identitas visual & palet warna
└── package.json
```

## Menjalankan Secara Lokal

1. Instal dependensi:
   ```bash
   npm install
   ```
2. Salin konfigurasi environment (opsional):
   ```bash
   cp .env.example .env.local
   ```
3. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
4. Buka `http://localhost:3000` di peramban.

## Pengujian & Build Produksi (Siap Deploy ke Vercel)

```bash
npm test
npm run lint
npm run build
```
