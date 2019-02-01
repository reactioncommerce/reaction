import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeSurchargeOpaqueId } from "../../xforms/surcharge";
import xformSurchargeAmount from "../../xforms/xformSurchargeAmount";
import xformSurchargeMessage from "../../xforms/xformSurchargeMessage";

export default {
  _id: (node) => encodeSurchargeOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId),
  amount: (node, _, context) => node.amount && xformSurchargeAmount(context, node.shopId, node.amount),
  message: (node, { language }) => node.messagesByLanguage && node.messagesByLanguage.length && xformSurchargeMessage(language, node.messagesByLanguage)
};
