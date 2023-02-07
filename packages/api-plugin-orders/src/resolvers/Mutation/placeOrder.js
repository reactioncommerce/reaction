import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import {
  decodeCartOpaqueId,
  decodeFulfillmentMethodOpaqueId,
  decodeOrderItemsOpaqueIds,
  decodeShopOpaqueId
} from "../../xforms/id.js";

/**
 * @name Mutation/placeOrder
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the placeOrder GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.order - The order input
 * @param {Object[]} args.input.payments - Payment info
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} PlaceOrderPayload
 */
export default async function placeOrder(parentResult, { input }, context) {
  const { clientMutationId = null, order, payments } = input;
  const { cartId: opaqueCartId, fulfillmentGroups, shopId: opaqueShopId } = order;

  let cartId = null;
  if (opaqueCartId) {
    cartId = isOpaqueId(opaqueCartId) ? decodeCartOpaqueId(opaqueCartId) : opaqueCartId;
  }
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const transformedFulfillmentGroups = fulfillmentGroups.map((group) => ({
    ...group,
    items: decodeOrderItemsOpaqueIds(group.items),
    selectedFulfillmentMethodId: isOpaqueId(group.selectedFulfillmentMethodId) ?
      decodeFulfillmentMethodOpaqueId(group.selectedFulfillmentMethodId) : group.selectedFulfillmentMethodId,
    shopId: isOpaqueId(group.shopId) ? decodeShopOpaqueId(group.shopId) : group.shopId
  }));

  const { orders, token } = await context.mutations.placeOrder(context, {
    order: {
      ...order,
      cartId,
      fulfillmentGroups: transformedFulfillmentGroups,
      shopId
    },
    payments
  });

  return {
    clientMutationId,
    orders,
    token
  };
}
