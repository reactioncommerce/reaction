import { encodeFulfillmentMethodOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/fulfillment";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeSurchargeOpaqueId } from "../../xforms/surcharge.js";
import xformSurchargeAmount from "../../xforms/xformSurchargeAmount.js";
import getSurchargeMessageForLanguage from "../../util/getSurchargeMessageForLanguage.js";

export default {
  _id: (node) => encodeSurchargeOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId),
  amount: (node, _, context) => node.amount && xformSurchargeAmount(context, node.shopId, node.amount),
  message: (node, { language }) => node.messagesByLanguage &&
    node.messagesByLanguage.length &&
    getSurchargeMessageForLanguage(language, node.messagesByLanguage),
  methodIds: (node) => node.methodIds.map(encodeFulfillmentMethodOpaqueId)
};
