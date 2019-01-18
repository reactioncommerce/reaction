import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeSurchargeOpaqueId } from "../../xforms/surcharge";
import xformSurchargeMessage from "../../xforms/xformSurchargeMessage";

export default {
  _id: (node) => encodeSurchargeOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId),
  message: (node) => node.messagesByLanguage && node.messagesByLanguage.length && xformSurchargeMessage(node.language, node.messagesByLanguage)
};
