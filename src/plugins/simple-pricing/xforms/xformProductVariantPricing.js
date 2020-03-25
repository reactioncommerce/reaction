import accounting from "accounting-js";
import getDisplayPrice from "../util/getDisplayPrice.js";

export default (node) => {
  let pricing = {};
  const { price } = node;
  if (typeof price === "object") {
    pricing = {
      compareAtPrice: null,
      displayPrice: getDisplayPrice(price.min, price.max),
      maxPrice: price.max,
      minPrice: price.min,
      price: null
    };
  } else {
    pricing = {
      compareAtPrice: node.compareAtPrice || 0,
      displayPrice: accounting.formatMoney(price),
      maxPrice: price || 0,
      minPrice: price || 0,
      price: price || 0
    };
  }

  return pricing;
};
