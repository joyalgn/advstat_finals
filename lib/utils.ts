export function fmt(value: number, decimals = 4): string {
  return Number.isFinite(value) ? value.toFixed(decimals) : "—";
}

export function fmtP(value: number): string {
  return value < 0.0001 ? "< 0.0001" : value.toFixed(4);
}