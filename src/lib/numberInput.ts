export const parseNumberInput = (value: string, fallback = 0) =>
  value === "" ? fallback : Number(value);
