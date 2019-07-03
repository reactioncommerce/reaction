import xformPricingArray from "../util/xformPricingArray";

export default {
  pricing: (node) => xformPricingArray(node.pricing)
};
