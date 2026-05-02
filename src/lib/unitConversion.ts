export const unitToGrams: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  ml: 1,
  cl: 10,
  dl: 100,
  l: 1000,
  liter: 1000,
  tsk: 5,
  tsp: 5,
  msk: 15,
  tbsp: 15,
  krm: 1,
  nypa: 1,
  pinch: 1,
  skvätt: 5,
  dash: 5,
  klyfta: 4,
  klyftor: 4,
  clove: 4,
  cloves: 4,
  skiva: 20,
  skivor: 20,
  slice: 20,
  slices: 20,
  st: 50,
  stk: 50,
  styck: 50,
  "styck.": 50,
  stycken: 50,
  piece: 50,
  pieces: 50,
  portion: 200,
  portioner: 200,
  cup: 240,
  cups: 240,
  kopp: 240,
  koppar: 240,
  oz: 28,
  lb: 454,
  knippe: 50,
  bunch: 50,
};

/**
 * Estimates the gram weight for a given ingredient amount and unit.
 * Returns 0 when the unit is unknown so the caller can decide how to handle it.
 * An empty unit is treated as grams.
 */
export const estimateGrams = (amount: number, unit: string): number => {
  if (amount <= 0) {
    return 0;
  }

  const trimmed = unit.trim().toLowerCase();

  if (trimmed === "") {
    return amount;
  }

  const factor = unitToGrams[trimmed];
  return factor ? amount * factor : 0;
};
