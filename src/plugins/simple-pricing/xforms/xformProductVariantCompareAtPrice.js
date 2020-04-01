import Logger from "@reactioncommerce/logger";

export default (node) => {
  Logger.warn("Using deprecated field `compareAtPrice` on type `ProductVariant`, please use field `pricing` instead.");

  return node.compareAtPrice;
};
