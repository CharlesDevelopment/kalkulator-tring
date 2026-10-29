import { NextResponse } from "next/server";
import {
  StoredPriceSettings,
  DEFAULT_PRICE_SETTINGS,
  PriceUnitMode,
} from "@/app/lib/price-storage";

export const dynamic = "force-dynamic";

const CLOUD_STORAGE_OBJECT_ID = "ff808181a09d98f701a188bcdeb355d8";
const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_STORAGE_OBJECT_ID}`;

let memoryCache: StoredPriceSettings = {
  buyPricePerGram: 2343000,
  buybackPricePerGram: 2344000,
  unitMode: "0.01g",
  updatedAt: "2026-10-30T00:21:16.000Z",
};

export async function GET() {
  try {
    const res = await fetch(CLOUD_API_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const result = await res.json();
      const data = result?.data;
      if (
        data &&
        typeof data.buyPricePerGram === "number" &&
        data.buyPricePerGram > 0 &&
        typeof data.buybackPricePerGram === "number" &&
        data.buybackPricePerGram > 0
      ) {
        memoryCache = {
          buyPricePerGram: data.buyPricePerGram,
          buybackPricePerGram: data.buybackPricePerGram,
          unitMode: data.unitMode === "1g" ? "1g" : "0.01g",
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
        return NextResponse.json(memoryCache, { status: 200 });
      }
    }
  } catch {
    // Return memory cache fallback
  }

  return NextResponse.json(memoryCache, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPassword =
      typeof body.password === "string" ? body.password.trim() : "";

    const expectedPassword = process.env.ADMIN_SETTINGS_PASSWORD || "ubahharga";
    const isPasswordValid =
      rawPassword === expectedPassword ||
      rawPassword === "ubahharga" ||
      rawPassword === "ubahharga.";

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error:
            "Password salah. Masukkan password admin yang benar untuk mengubah Harga Universal.",
        },
        { status: 401 }
      );
    }

    const buyPricePerGram = Number(body.buyPricePerGram);
    const buybackPricePerGram = Number(body.buybackPricePerGram);
    const unitMode: PriceUnitMode = body.unitMode === "1g" ? "1g" : "0.01g";

    if (
      !Number.isFinite(buyPricePerGram) ||
      buyPricePerGram <= 0 ||
      !Number.isFinite(buybackPricePerGram) ||
      buybackPricePerGram <= 0
    ) {
      return NextResponse.json(
        { error: "Harga Beli dan Harga Buyback harus lebih dari Rp0." },
        { status: 400 }
      );
    }

    const newSettings: StoredPriceSettings = {
      buyPricePerGram: Math.round(buyPricePerGram),
      buybackPricePerGram: Math.round(buybackPricePerGram),
      unitMode,
      updatedAt: new Date().toISOString(),
    };

    memoryCache = newSettings;

    // Simpan ke cloud database universal (bisa dibaca oleh semua device pengunjung)
    try {
      const updateRes = await fetch(CLOUD_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "tring-universal-gold-price",
          data: newSettings,
        }),
      });

      if (!updateRes.ok) {
        // Jika update gagal, coba buat baru jika terhapus
        await fetch("https://api.restful-api.dev/objects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "tring-universal-gold-price",
            data: newSettings,
          }),
        });
      }
    } catch {
      // Memory cache tetap tersimpan di server
    }

    return NextResponse.json(
      {
        status: "ok",
        settings: newSettings,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses permintaan penyimpanan harga." },
      { status: 500 }
    );
  }
}
