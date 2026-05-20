export function getDelayMinutes(planned: string, actual: string): number {
  if (!planned || !actual) return 0;
  const [pH, pM] = planned.split(":").map(Number);
  const [aH, aM] = actual.split(":").map(Number);

  if (isNaN(pH) || isNaN(pM) || isNaN(aH) || isNaN(aM)) return 0;

  let pTotal = pH * 60 + pM;
  let aTotal = aH * 60 + aM;

  // Handle midnight wrap-around (e.g. planned 23:58, actual 00:02)
  if (aH < 4 && pH >= 20) {
    aTotal += 24 * 60;
  } else if (pH < 4 && aH >= 20) {
    pTotal += 24 * 60;
  }

  return aTotal - pTotal;
}
