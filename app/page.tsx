import { CalculatorApp } from "@/app/components/CalculatorApp";
import {
  StoredPriceSettings,
  DEFAULT_PRICE_SETTINGS,
} from "@/app/lib/price-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CLOUD_STORAGE_OBJECT_ID = "ff808181a09d98f701a188bcdeb355d8";
const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_STORAGE_OBJECT_ID}`;

async function getInitialUniversalSettings(): Promise<StoredPriceSettings> {
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
        return {
          buyPricePerGram: data.buyPricePerGram,
          buybackPricePerGram: data.buybackPricePerGram,
          unitMode: data.unitMode === "1g" ? "1g" : "0.01g",
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      }
    }
  } catch {
    // Return fallback
  }

  return DEFAULT_PRICE_SETTINGS;
}

export default async function Page() {
  const initialUniversalSettings = await getInitialUniversalSettings();

  return (
    <CalculatorApp initialUniversalSettings={initialUniversalSettings} />
  );
}
