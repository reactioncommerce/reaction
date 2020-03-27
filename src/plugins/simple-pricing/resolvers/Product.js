import xformProductPricing from "../xforms/xformProductPricing.js";
import xformProductPrice from "../xforms/xformProductPrice.js";

export default {
  price: (node) => xformProductPrice(node),
  pricing: (node, _, context) => xformProductPricing(node, context)
};
