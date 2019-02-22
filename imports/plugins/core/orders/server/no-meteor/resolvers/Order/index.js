import { encodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { encodeOrderOpaqueId, xformOrderPayment } from "@reactioncommerce/reaction-graphql-xforms/order";
import { resolveAccountFromAccountId, resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import orderStatus from "./orderStatus";
import orderSummary from "./orderSummary";
import totalItemQuantity from "./totalItemQuantity";

export default {
  _id: (node) => encodeOrderOpaqueId(node._id),
  account: resolveAccountFromAccountId,
  cartId: (node) => encodeCartOpaqueId(node._id),
  fulfillmentGroups: (node) => node.shipping || [],
  notes: (node) => node.notes || [],
  payments: (node) => (Array.isArray(node.payments) ? node.payments.map(xformOrderPayment) : null),
  shop: resolveShopFromShopId,
  status: (node, { language }, context) => orderStatus(context, node, language),
  summary: (node, _, context) => orderSummary(context, node),
  totalItemQuantity
};
