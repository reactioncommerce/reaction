import getCurrencyDefinitionByCode from "@reactioncommerce/api-utils/getCurrencyDefinitionByCode.js";
import { encodeShopOpaqueId } from "../../xforms/id.js";
import brandAssets from "./brandAssets.js";

export default {
  _id: (node) => encodeShopOpaqueId(node._id),
  brandAssets,
  currency: (shop) => getCurrencyDefinitionByCode(shop.currency)
};
