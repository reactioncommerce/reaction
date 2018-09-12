import { encodeCurrencyOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/currency";

export default {
  _id: (node) => encodeCurrencyOpaqueId(node._id)
};
