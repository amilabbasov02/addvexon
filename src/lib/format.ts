/** Qəpiklə saxlanan AZN məbləğini formatlayır. 10000 → "100 AZN". */
export function azn(qepik: number): string {
  const manat = qepik / 100;
  const s = Number.isInteger(manat) ? String(manat) : manat.toFixed(2);
  return `${s} AZN`;
}
