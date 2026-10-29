export type PriceUnitMode = "0.01g" | "1g";

export interface StoredPriceSettings {
  buyPricePerGram: number;
  buybackPricePerGram: number;
  unitMode: PriceUnitMode;
  updatedAt: string;
}

export const LOCAL_PRICE_STORAGE_KEY = "tring-local-price-override-v1";

export const DEFAULT_PRICE_SETTINGS: StoredPriceSettings = {
  buyPricePerGram: 1545000,
  buybackPricePerGram: 1495000,
  unitMode: "0.01g",
  updatedAt: "2026-10-29T16:40:00.000Z",
};

export function loadLocalPriceOverride(): StoredPriceSettings | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_PRICE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredPriceSettings>;
    if (
      typeof parsed.buyPricePerGram === "number" &&
      parsed.buyPricePerGram > 0 &&
      typeof parsed.buybackPricePerGram === "number" &&
      parsed.buybackPricePerGram > 0
    ) {
      return {
        buyPricePerGram: parsed.buyPricePerGram,
        buybackPricePerGram: parsed.buybackPricePerGram,
        unitMode:
          parsed.unitMode === "1g" || parsed.unitMode === "0.01g"
            ? parsed.unitMode
            : "0.01g",
        updatedAt:
          typeof parsed.updatedAt === "string" && parsed.updatedAt
            ? parsed.updatedAt
            : new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveLocalPriceOverride(settings: StoredPriceSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LOCAL_PRICE_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function clearLocalPriceOverride(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LOCAL_PRICE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
