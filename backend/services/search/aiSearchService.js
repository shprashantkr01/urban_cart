import productModel from "../../models/productModel.js";

import searchCache from "../../utils/cache/searchCache.js";

import {
  toQueryWords
} from "../../utils/search/queryHelpers.js";

import shouldUseAI
  from "../../utils/search/shouldUseAI.js";

import parseAiFilters
  from "../../utils/search/parseAiFilters.js";

import buildMongoQuery
  from "../../utils/search/buildMongoQuery.js";

import {
  rankProducts
} from "./rankingService.js";

import {
  generateGeminiContent
} from "../ai/geminiService.js";

import {
  generateGroqContent
} from "../ai/groqService.js";

const fetchAiFilters = async (
  q,
  fallbackKeywords
) => {

  try {

    const prompt = `
Extract filters from clothing search query and return ONLY valid JSON.
{
  "category": "Men | Women | Kids | null",
  "subCategory": "Topwear | Bottomwear | Winterwear | null",
  "maxPrice": number or null,
  "keywords": []
}

If the user does not specify a numeric price, return maxPrice: null.
Do not infer a number from words like affordable, cheap, budget, or value.

Query: "${q}"
`;

    const raw =
      await generateGeminiContent(prompt);

    console.log(
      "Task Completed Successfully with Gemini"
    );

    return parseAiFilters(
      JSON.parse(raw),
      fallbackKeywords,
      q
    );

  } catch (geminiError) {

    console.log(
      "⚠️ Gemini failed → switching to Groq"
    );
  }

  try {

    let raw = await generateGroqContent({

      systemPrompt: `
Return ONLY valid JSON. No markdown.
{
  "category": "Men | Women | Kids | null",
  "subCategory": "Topwear | Bottomwear | Winterwear | null",
  "maxPrice": number or null,
  "keywords": []
}

If the user does not specify a numeric price, return maxPrice: null.
Do not infer a number from words like affordable, cheap, or budget.
`,

      userPrompt: `Query: "${q}"`,

      temperature: 0,

      maxTokens: 150
    });

    console.log(
      "Task Completed Successfully with Groq"
    );

    return parseAiFilters(
      JSON.parse(raw),
      fallbackKeywords,
      q
    );

  } catch (groqError) {

    console.log(
      "❌ Groq failed → fallback",
      groqError?.message
    );

    return {
      category: null,
      subCategory: null,
      maxPrice: null,
      keywords: fallbackKeywords
    };
  }
};

const createSearchResponse = (
  products,
  filters,
  usedAI
) => ({

  success: true,

  products:
    rankProducts(products, filters)
      .slice(0, 20),

  filters,

  usedAI
});

const aiSearchService = async (q) => {

  if (!q || q.trim().length === 0) {

    return {
      success: false,
      message: "Query is required"
    };
  }

  const normalizedQ = q.trim();

  // CACHE HIT
  if (searchCache.has(normalizedQ)) {
    return searchCache.get(normalizedQ);
  }

  const words = toQueryWords(normalizedQ);

  const basicText =
    words.length > 0
      ? words.join("|")
      : normalizedQ;

  const basicQuery = {
    $or: [
      {
        name: {
          $regex: basicText,
          $options: "i"
        }
      },
      {
        description: {
          $regex: basicText,
          $options: "i"
        }
      }
    ]
  };

  const basicResults =
    await productModel
      .find(basicQuery)
      .limit(10);

  const useAI = shouldUseAI(
    normalizedQ,
    words,
    basicResults.length
  );

  const keywordFilters = {
    category: null,
    subCategory: null,
    maxPrice: null,
    keywords: words
  };

  // BASIC SEARCH ONLY
  if (!useAI) {

    const response =
      createSearchResponse(
        basicResults,
        keywordFilters,
        false
      );

    searchCache.set(
      normalizedQ,
      response
    );

    setTimeout(() => {
      searchCache.delete(normalizedQ);
    }, 10 * 60 * 1000);

    return response;
  }

  // AI SEARCH
  const filters =
    await fetchAiFilters(
      normalizedQ,
      words
    );

  const mongoQuery =
    buildMongoQuery(
      filters,
      normalizedQ
    );

  const products =
    await productModel
      .find(mongoQuery)
      .limit(200);

  const response =
    createSearchResponse(
      products,
      filters,
      true
    );

  searchCache.set(
    normalizedQ,
    response
  );

  setTimeout(() => {
    searchCache.delete(normalizedQ);
  }, 10 * 60 * 1000);

  return response;
};

export default aiSearchService;