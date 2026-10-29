const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const gramFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const percentFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatRupiah(value: number): string {
  if (!Number.isFinite(value)) return "Rp0";
  return idrFormatter.format(Math.round(value)).replace(/\u00A0/g, "");
}

export function formatSignedRupiah(value: number): string {
  if (!Number.isFinite(value)) return "Rp0";
  const rounded = Math.round(value);
  if (rounded > 0) return `+${formatRupiah(rounded)}`;
  if (rounded < 0) return `-${formatRupiah(Math.abs(rounded))}`;
  return "Rp0";
}

export function formatThousandSeparator(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "";
  return numberFormatter.format(Math.round(value));
}

export function parseDigitsToNumber(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatGram(value: number): string {
  if (!Number.isFinite(value)) return "0,0000 g";
  return `${gramFormatter.format(value)} g`;
}

export function formatPercentage(value: number): string {
  if (!Number.isFinite(value)) return "0,00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${percentFormatter.format(value)}%`;
}

export function formatTimestampWIB(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Waktu tidak diketahui";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date) + " WIB";
}
