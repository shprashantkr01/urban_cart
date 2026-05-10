import normalizeCategory from "./normalizeCategory.js";
import normalizeSubCategory from "./normalizeSubCategory.js";

import {
  normalizeMaxPriceValue
} from "./queryHelpers.js";

const parseAiFilters = (rawFilters, fallbackKeywords, rawQuery) => {

  if (!rawFilters || typeof rawFilters !== "object") {
    return {
      category: null,
      subCategory: null,
      maxPrice: null,
      keywords: fallbackKeywords
    };
  }

  const parseKeywords = (keywords) => {

    if (!Array.isArray(keywords)) {
      return fallbackKeywords;
    }

    return keywords
      .map((kw) => kw?.toString().trim())
      .filter((kw) => kw && kw.length > 0);
  };

  return {
    category: normalizeCategory(rawFilters.category),

    subCategory: normalizeSubCategory(
      rawFilters.subCategory
    ),

    maxPrice: normalizeMaxPriceValue(
      rawFilters.maxPrice,
      rawQuery
    ),

    keywords: parseKeywords(rawFilters.keywords)
  };
};

export default parseAiFilters;