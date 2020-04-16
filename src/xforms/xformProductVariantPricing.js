import accounting from "accounting-js";
import getCurrencyDefinitionByCode from "@reactioncommerce/api-utils/getCurrencyDefinitionByCode.js";
import getDisplayPrice from "../util/getDisplayPrice.js";

export default async (node, context) => {
  const { Shops } = context.collections;
  const shop = await Shops.findOne({ _id: node.shopId }, { projection: { currency: 1 } });
  const currencyDefinition = getCurrencyDefinitionByCode(shop.currency);

  let pricing = {};
  const { price } = node;
  if (typeof price === "object") {
    pricing = {
      compareAtPrice: null,
      displayPrice: getDisplayPrice(price.min, price.max, currencyDefinition),
      maxPrice: price.max,
      minPrice: price.min,
      price: null
    };
  } else {
    pricing = {
      compareAtPrice: node.compareAtPrice || 0,
      displayPrice: accounting.formatMoney(price, currencyDefinition.symbol),
      maxPrice: price || 0,
      minPrice: price || 0,
      price: price || 0
    };
  }

  return pricing;
};
