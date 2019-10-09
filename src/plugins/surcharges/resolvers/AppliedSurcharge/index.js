import { encodeSurchargeOpaqueId } from "../../xforms/surcharge.js";
import xformSurchargeAmount from "../../xforms/xformSurchargeAmount.js";
import getSurchargeMessageForLanguage from "../../util/getSurchargeMessageForLanguage.js";

export default {
  _id: (node) => encodeSurchargeOpaqueId(node._id),
  amount: (node, _, context) => node.amount && xformSurchargeAmount(context, node.shopId, node.amount),
  message: (node, { language }) => node.messagesByLanguage &&
    node.messagesByLanguage.length &&
    getSurchargeMessageForLanguage(language, node.messagesByLanguage)
};
