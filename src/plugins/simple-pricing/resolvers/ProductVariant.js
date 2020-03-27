import xformProductVariantPricing from "../xforms/xformProductVariantPricing.js";
import xformProductVariantPrice from "../xforms/xformProductVariantPrice.js";
import xformProductVariantCompareAtPrice from "../xforms/xformProductVariantCompareAtPrice.js";

export default {
  compareAtPrice: (node) => xformProductVariantCompareAtPrice(node),
  price: (node) => xformProductVariantPrice(node),
  pricing: (node, _, context) => xformProductVariantPricing(node, context)
};
