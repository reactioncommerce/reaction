import { encodeFulfillmentMethodOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeFulfillmentMethodOpaqueId(node._id)
};
