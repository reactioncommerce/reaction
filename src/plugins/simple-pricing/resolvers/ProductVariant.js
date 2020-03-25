import xformProductVariantPricing from "../xforms/xformProductVariantPricing.js";
import xformProductVariantPrice from "../xforms/xformProductVariantPrice.js";

export default {
  price: (node) => xformProductVariantPrice(node),
  pricing: (node) => xformProductVariantPricing(node)
};
