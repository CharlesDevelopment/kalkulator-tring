export type PriceUnitMode = "0.01g" | "1g";

export interface StoredPriceSettings {
  buyPricePerGram: number;
  buybackPricePerGram: number;
  unitMode: PriceUnitMode;
  updatedAt: string;
}

export const PRICE_SETTINGS_STORAGE_KEY = "tring-price-settings-v1";

export const DEFAULT_PRICE_SETTINGS: StoredPriceSettings = {
  buyPricePerGram: 1545000,
  buybackPricePerGram: 1495000,
  unitMode: "0.01g",
  updatedAt: "2026-10-29T15:00:00.000Z",
};

export function loadPriceSettings(): StoredPriceSettings {
  if (typeof window === "undefined") {
    return DEFAULT_PRICE_SETTINGS;
  }
  try {
    const raw = window.localStorage.getItem(PRICE_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_PRICE_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<StoredPriceSettings>;
    const buyPricePerGram =
      typeof parsed.buyPricePerGram === "number" && parsed.buyPricePerGram > 0
        ? parsed.buyPricePerGram
        : DEFAULT_PRICE_SETTINGS.buyPricePerGram;
    const buybackPricePerGram =
      typeof parsed.buybackPricePerGram === "number" &&
      parsed.buybackPricePerGram > 0
        ? parsed.buybackPricePerGram
        : DEFAULT_PRICE_SETTINGS.buybackPricePerGram;
    const unitMode: PriceUnitMode =
      parsed.unitMode === "1g" || parsed.unitMode === "0.01g"
        ? parsed.unitMode
        : DEFAULT_PRICE_SETTINGS.unitMode;
    const updatedAt =
      typeof parsed.updatedAt === "string" && parsed.updatedAt
        ? parsed.updatedAt
        : DEFAULT_PRICE_SETTINGS.updatedAt;

    return {
      buyPricePerGram,
      buybackPricePerGram,
      unitMode,
      updatedAt,
    };
  } catch {
    return DEFAULT_PRICE_SETTINGS;
  }
}

export function savePriceSettings(settings: StoredPriceSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PRICE_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // Ignore storage quota errors
  }
}
