import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface GoldPriceResponse {
  buyPrice: number;
  buybackPrice: number;
  source: string;
  isLive: boolean;
  updatedAt: string;
  message?: string;
}

const FALLBACK_BUY_PRICE = 1545000;
const FALLBACK_BUYBACK_PRICE = 1495000;

function extractPriceNumbersFromHtml(html: string): {
  buyPrice: number;
  buybackPrice: number;
} | null {
  // Match common Pegadaian Tabungan Emas 0.01g or 1g price patterns in JSON/HTML payloads
  const jsonBuyMatch = html.match(/"hargaBeli"\s*:\s*"?(\d{4,9})"?/i);
  const jsonSellMatch = html.match(/"hargaJual"\s*:\s*"?(\d{4,9})"?/i);

  if (jsonBuyMatch && jsonSellMatch) {
    let buy = Number.parseInt(jsonBuyMatch[1], 10);
    let sell = Number.parseInt(jsonSellMatch[1], 10);
    // Pegadaian Tabungan Emas sometimes reports per 0.01 gram (e.g. 15450 -> 1,545,000/g)
    if (buy > 5000 && buy < 50000) buy *= 100;
    if (sell > 5000 && sell < 50000) sell *= 100;
    if (buy > 500000 && sell > 400000 && buy >= sell) {
      return { buyPrice: buy, buybackPrice: sell };
    }
  }

  // Match Rupiah numbers around "Harga Beli" and "Harga Jual / Buyback"
  const rpMatches = Array.from(
    html.matchAll(/Rp\s*([123]\.\d{3}\.\d{3}|[12]\d\.\d{3})/gi)
  ).map((m) => Number.parseInt(m[1].replace(/\./g, ""), 10));

  const normalized = rpMatches.map((val) =>
    val > 5000 && val < 50000 ? val * 100 : val
  );

  const validPerGram = normalized.filter((v) => v >= 800000 && v <= 3500000);
  if (validPerGram.length >= 2) {
    const first = validPerGram[0];
    const second = validPerGram[1];
    const buyPrice = Math.max(first, second);
    const buybackPrice = Math.min(first, second);
    if (buyPrice > buybackPrice) {
      return { buyPrice, buybackPrice };
    }
  }

  return null;
}

export async function GET() {
  const timeoutMs = Number.parseInt(
    process.env.PRICE_FETCH_TIMEOUT_MS || "5000",
    10
  );
  const customEndpoint = process.env.PEGADAIAN_PRICE_API_URL;

  const candidateUrls = [
    ...(customEndpoint ? [customEndpoint] : []),
    "https://sahabat.pegadaian.co.id/harga-emas",
    "https://www.pegadaian.co.id/ewallet/emas",
  ];

  for (const url of candidateUrls) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Accept: "application/json, text/html, */*",
        },
        cache: "no-store",
      });

      clearTimeout(timer);

      if (!response.ok) continue;

      const text = await response.text();
      const extracted = extractPriceNumbersFromHtml(text);

      if (extracted) {
        const payload: GoldPriceResponse = {
          buyPrice: extracted.buyPrice,
          buybackPrice: extracted.buybackPrice,
          source: new URL(url).hostname,
          isLive: true,
          updatedAt: new Date().toISOString(),
        };
        return NextResponse.json(payload, { status: 200 });
      }
    } catch {
      clearTimeout(timer);
    }
  }

  const fallbackPayload: GoldPriceResponse = {
    buyPrice: FALLBACK_BUY_PRICE,
    buybackPrice: FALLBACK_BUYBACK_PRICE,
    source: "Acuan Standar Tring! Pegadaian (Mode Offline / Fallback)",
    isLive: false,
    updatedAt: new Date().toISOString(),
    message:
      "Endpoint publik Pegadaian sedang tidak merespons atau dibatasi jaringan. Menampilkan harga acuan standar yang dapat Anda ubah langsung via Override Manual.",
  };

  return NextResponse.json(fallbackPayload, { status: 200 });
}
