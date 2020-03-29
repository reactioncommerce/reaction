import getCurrencyDefinitionByCode from "@reactioncommerce/api-utils/getCurrencyDefinitionByCode.js";
import getDisplayPrice from "../util/getDisplayPrice.js";

export default async (node, context) => {
  const { price } = node;
  const { Shops } = context.collections;
  const shop = await Shops.findOne({ _id: node.shopId }, { projection: { currency: 1 } });
  const currencyDefinition = getCurrencyDefinitionByCode(shop.currency);

  const pricing = {
    displayPrice: getDisplayPrice(price.min, price.max, currencyDefinition),
    maxPrice: price.max,
    minPrice: price.min
  };

  return pricing;
};
