import { encodeFulfillmentMethodOpaqueId, encodeShopOpaqueId, encodeSurchargeOpaqueId } from "../../xforms/id.js";
import xformSurchargeAmount from "../../xforms/xformSurchargeAmount.js";
import getSurchargeMessageForLanguage from "../../util/getSurchargeMessageForLanguage.js";

export default {
  _id: (node) => encodeSurchargeOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId),
  amount: (node, _, context) => node.amount !== undefined && xformSurchargeAmount(context, node.shopId, node.amount),
  message: (node, { language }) => node.messagesByLanguage &&
    node.messagesByLanguage.length &&
    getSurchargeMessageForLanguage(language, node.messagesByLanguage),
  methodIds: (node) => node.methodIds.map(encodeFulfillmentMethodOpaqueId)
};
