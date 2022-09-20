import Logger from "@reactioncommerce/logger";

export default (node) => {
  Logger.warn("Using deprecated field `price` on type `Product`, please use field `pricing` instead.");

  return node.price;
};
