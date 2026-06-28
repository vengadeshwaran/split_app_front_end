export const CURRENCY_LIST = [
  { name: "UAE Dirham (AED)",  symbol: "AED" },
  { name: "Indian Rupee (₹)",  symbol: "₹" },
  { name: "US Dollar (USD)",   symbol: "$" },
  { name: "Euro (EUR)",        symbol: "€" },
  { name: "British Pound (GBP)", symbol: "£" },
];

export const DEFAULT_CURRENCY = CURRENCY_LIST[0];

export const getSymbolByName = (name) =>
  CURRENCY_LIST.find((c) => c.name === name)?.symbol ?? "AED";
