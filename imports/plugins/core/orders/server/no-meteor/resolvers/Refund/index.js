import amount from "./amount";
import createdAt from "./createdAt";

export default {
  _id: (node) => node._id,
  amount,
  createdAt,
  paymentDisplayName: (node) => node.paymentDisplayName,
  reason: (node) => node.reason
};
