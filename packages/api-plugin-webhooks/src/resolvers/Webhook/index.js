import {
  encodeShopOpaqueId
} from "../../xforms/id.js";

export default {
  shopId: (webhook) => encodeShopOpaqueId(webhook.shopId)
};
