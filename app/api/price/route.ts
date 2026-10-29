import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  StoredPriceSettings,
  DEFAULT_PRICE_SETTINGS,
  PriceUnitMode,
} from "@/app/lib/price-storage";

export const dynamic = "force-dynamic";

const GITHUB_REPO =
  process.env.GITHUB_REPO || "CharlesDevelopment/kalkulator-tring";
const GITHUB_FILE_PATH = "data/universal-price.json";

let memoryCache: StoredPriceSettings | null = null;

function readLocalDataFile(): StoredPriceSettings {
  try {
    const filePath = path.join(process.cwd(), "data", "universal-price.json");
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content) as Partial<StoredPriceSettings>;
    if (
      typeof parsed.buyPricePerGram === "number" &&
      parsed.buyPricePerGram > 0 &&
      typeof parsed.buybackPricePerGram === "number" &&
      parsed.buybackPricePerGram > 0
    ) {
      return {
        buyPricePerGram: parsed.buyPricePerGram,
        buybackPricePerGram: parsed.buybackPricePerGram,
        unitMode: parsed.unitMode === "1g" ? "1g" : "0.01g",
        updatedAt: parsed.updatedAt || DEFAULT_PRICE_SETTINGS.updatedAt,
      };
    }
  } catch {
    // Fallback below
  }
  return memoryCache || DEFAULT_PRICE_SETTINGS;
}

export async function GET() {
  const token = process.env.GITHUB_PAT;

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "kalkulator-tring-universal-price",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.content === "string") {
        const decoded = Buffer.from(data.content, "base64").toString("utf-8");
        const parsed = JSON.parse(decoded) as Partial<StoredPriceSettings>;
        if (
          typeof parsed.buyPricePerGram === "number" &&
          parsed.buyPricePerGram > 0 &&
          typeof parsed.buybackPricePerGram === "number" &&
          parsed.buybackPricePerGram > 0
        ) {
          const result: StoredPriceSettings = {
            buyPricePerGram: parsed.buyPricePerGram,
            buybackPricePerGram: parsed.buybackPricePerGram,
            unitMode: parsed.unitMode === "1g" ? "1g" : "0.01g",
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          };
          memoryCache = result;
          return NextResponse.json(result, { status: 200 });
        }
      }
    }
  } catch {
    // Fall through to local file or memory cache
  }

  const fallback = readLocalDataFile();
  return NextResponse.json(fallback, { status: 200 });
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

    // Update local file when running in local dev environment
    try {
      const filePath = path.join(process.cwd(), "data", "universal-price.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify(newSettings, null, 2) + "\n",
        "utf-8"
      );
    } catch {
      // Read-only filesystem in serverless production, handled by GitHub API below
    }

    const token = process.env.GITHUB_PAT;
    if (token) {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "kalkulator-tring-universal-price",
      };

      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
        { headers, cache: "no-store" }
      );

      let sha: string | undefined;
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      const contentBase64 = Buffer.from(
        JSON.stringify(newSettings, null, 2) + "\n",
        "utf-8"
      ).toString("base64");

      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            message: `chore: update universal gold price to ${newSettings.buyPricePerGram}/${newSettings.buybackPricePerGram} [skip ci]`,
            content: contentBase64,
            ...(sha ? { sha } : {}),
          }),
        }
      );

      if (!putRes.ok) {
        const errText = await putRes.text();
        return NextResponse.json(
          {
            error: `Gagal menyimpan ke penyimpanan universal cloud: ${errText}`,
          },
          { status: 500 }
        );
      }
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
