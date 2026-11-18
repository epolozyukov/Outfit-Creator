const formatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
});

/** Formats an integer amount in grosz as a PLN string. */
export function formatPLN(minor: number): string {
  return formatter.format(minor / 100);
}
