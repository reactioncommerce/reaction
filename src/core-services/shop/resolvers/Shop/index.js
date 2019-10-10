import getCurrencyDefinitionByCode from "@reactioncommerce/api-utils/getCurrencyDefinitionByCode.js";
import { encodeShopOpaqueId } from "../../xforms/id.js";
import brandAssets from "./brandAssets.js";
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
  tags
};
