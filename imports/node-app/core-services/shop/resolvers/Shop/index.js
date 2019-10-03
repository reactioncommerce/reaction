import getCurrencyDefinitionByCode from "@reactioncommerce/api-utils/getCurrencyDefinitionByCode.js";
import { encodeNavigationTreeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationTree";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import brandAssets from "./brandAssets.js";
import defaultNavigationTree from "./defaultNavigationTree.js";
import tags from "./tags.js";

export default {
  _id: (node) => encodeShopOpaqueId(node._id),
  brandAssets,
  currencies(shop) {
    if (!shop || !shop.currencies) return [];

    // map over all provided currencies, provided in the format stored in our Shops collection,
    // and convert them to the format that GraphQL needs
    return Object.keys(shop.currencies).map((code) => ({
      ...getCurrencyDefinitionByCode(code),
      enabled: shop.currencies[code].enabled || false
    }));
  },
  currency: (shop) => getCurrencyDefinitionByCode(shop.currency),
  defaultNavigationTreeId: (shop) => encodeNavigationTreeOpaqueId(shop.defaultNavigationTreeId),
  defaultNavigationTree,
  tags
};
