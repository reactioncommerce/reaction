import { encodeFulfillmentMethodOpaqueId } from "../../../../xforms/fulfillment.js";

export default {
  _id: (node) => encodeFulfillmentMethodOpaqueId(node._id)
};
