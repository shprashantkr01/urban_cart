const toQueryWords = (query) =>
  query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);

const hasExplicitPrice = (query) =>
  /\d/.test(query) ||
  /\b(under|below|less than|max price|rupees|rs|₹|\$|usd|inr|eur|pounds|bucks|price)\b/i.test(query);

const normalizeMaxPriceValue = (value, rawQuery) => {
  const price = Number.isFinite(Number(value)) ? Number(value) : null;

  if (price == null) return null;

  if (rawQuery && !hasExplicitPrice(rawQuery)) return null;

  return price;
};

export {
  toQueryWords,
  hasExplicitPrice,
  normalizeMaxPriceValue
};