import { encodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { encodeOrderOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import { resolveAccountFromAccountId, resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import orderDisplayStatus from "./orderDisplayStatus";
import orderSummary from "./orderSummary";
import payments from "./payments";
import refunds from "./refunds";
import totalItemQuantity from "./totalItemQuantity";

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
