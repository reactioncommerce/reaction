import resolveAccountFromAccountId from "@reactioncommerce/api-utils/graphql/resolveAccountFromAccountId.js";
import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { encodeOrderOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import orderDisplayStatus from "./orderDisplayStatus.js";
import orderSummary from "./orderSummary.js";
import payments from "./payments.js";
import refunds from "./refunds.js";
import totalItemQuantity from "./totalItemQuantity.js";

export default {
  _id: (node) => encodeOrderOpaqueId(node._id),
  account: resolveAccountFromAccountId,
  cartId: (node) => encodeCartOpaqueId(node._id),
  displayStatus: (node, { language }, context) => orderDisplayStatus(context, node, language),
  fulfillmentGroups: (node) => node.shipping || [],
  notes: (node) => node.notes || [],
  payments: (node, _, context) => payments(context, node),
  refunds: (node, _, context) => refunds(context, node),
  shop: resolveShopFromShopId,
  status: (node) => node.workflow.status,
  summary: (node, _, context) => orderSummary(context, node),
  totalItemQuantity
};
