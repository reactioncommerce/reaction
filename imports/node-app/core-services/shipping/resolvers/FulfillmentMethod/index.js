import { encodeFulfillmentMethodOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/fulfillment";

export default {
  _id: (node) => encodeFulfillmentMethodOpaqueId(node._id)
};
