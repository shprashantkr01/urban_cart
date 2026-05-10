const normalizeSubCategory = (value) => {
  if (!value) return null;

  const normalized = value.toString().trim().toLowerCase();

  if (normalized.includes("top")) return "Topwear";
  if (normalized.includes("bottom")) return "Bottomwear";
  if (normalized.includes("winter")) return "Winterwear";

  return null;
};

export default normalizeSubCategory;