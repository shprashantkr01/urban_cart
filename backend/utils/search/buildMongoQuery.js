const buildMongoQuery = (filters, rawQuery) => {

  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.subCategory) {
    query.subCategory = filters.subCategory;
  }

  if (filters.maxPrice != null) {
    query.price = {
      $lte: filters.maxPrice
    };
  }

  if (filters.keywords?.length) {

    const safeKeywords = filters.keywords.map((k) =>
      k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );

    query.$or = [
      {
        name: {
          $regex: safeKeywords.join("|"),
          $options: "i"
        }
      },
      {
        description: {
          $regex: safeKeywords.join("|"),
          $options: "i"
        }
      }
    ];
  }

  if (Object.keys(query).length === 0) {

    query.$or = [
      {
        name: {
          $regex: rawQuery,
          $options: "i"
        }
      },
      {
        description: {
          $regex: rawQuery,
          $options: "i"
        }
      }
    ];
  }

  return query;
};

export default buildMongoQuery;