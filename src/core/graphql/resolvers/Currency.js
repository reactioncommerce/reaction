import { encodeCurrencyOpaqueId } from "/src/xforms/currency";

export default {
  _id: (node) => encodeCurrencyOpaqueId(node._id)
};
