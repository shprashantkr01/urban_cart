const categoryMap = {
  women: "Women",
  woman: "Women",
  ladies: "Women",
  female: "Women",
  girls: "Women",
  men: "Men",
  man: "Men",
  male: "Men",
  boys: "Men",
  kids: "Kids",
  kid: "Kids"
};

const normalizeCategory = (value) => {
  if (!value) return null;

  const normalized = value.toString().trim().toLowerCase();

  for (const key in categoryMap) {
    if (normalized.includes(key)) {
      return categoryMap[key];
    }
  }

  return null;
};

export default normalizeCategory;