import xformPricingArray from "../util/xformPricingArray.js";

export default {
  pricing: (node) => xformPricingArray(node.pricing)
};
