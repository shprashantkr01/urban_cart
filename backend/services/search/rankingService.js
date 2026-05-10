const scoreProduct = (product, filters) => {

  let score = 0;

  if (
    filters.category &&
    product.category === filters.category
  ) {
    score += 3;
  }

  if (
    filters.subCategory &&
    product.subCategory === filters.subCategory
  ) {
    score += 2;
  }

  if (
    filters.maxPrice &&
    product.price <= filters.maxPrice
  ) {
    score += 1;
  }

  if (filters.keywords?.length) {

    filters.keywords.forEach((k) => {

      const keyword = k.toLowerCase();

      if (
        product.name
          .toLowerCase()
          .includes(keyword)
      ) {
        score += 3;
      }

      if (
        product.description
          .toLowerCase()
          .includes(keyword)
      ) {
        score += 2;
      }

    });
  }

  return score;
};

const rankProducts = (products, filters) => {

  return products
    .map((p) => ({
      ...p._doc,
      score: scoreProduct(p, filters)
    }))
    .sort((a, b) => b.score - a.score);
};

export {
  scoreProduct,
  rankProducts
};