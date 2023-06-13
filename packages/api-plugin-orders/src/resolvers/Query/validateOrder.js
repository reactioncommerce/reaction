import {
  decodeCartOpaqueId,
  decodeFulfillmentMethodOpaqueId,
  decodeOrderItemsOpaqueIds,
  decodeShopOpaqueId
} from "../../xforms/id.js";

/**
 * @name Query.validateOrder
 * @method
 * @memberof Order/GraphQL
 * @summary Validate if the order is ready
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.order - The order input
 * @param {Object[]} args.input.payments - Payment info
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} A validation result object
 */
export default async function validateOrder(parentResult, { input }, context) {
  const { order, payments } = input;
  const { cartId: opaqueCartId, fulfillmentGroups, shopId: opaqueShopId } = order;

  const cartId = opaqueCartId ? decodeCartOpaqueId(opaqueCartId) : null;
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const transformedFulfillmentGroups = fulfillmentGroups.map((group) => ({
    ...group,
    items: decodeOrderItemsOpaqueIds(group.items),
    selectedFulfillmentMethodId: decodeFulfillmentMethodOpaqueId(group.selectedFulfillmentMethodId),
    shopId: decodeShopOpaqueId(group.shopId)
  }));

  const { errors, success } = await context.queries.validateOrder(
    context,
    {
      order: {
        ...order,
        cartId,
        fulfillmentGroups: transformedFulfillmentGroups,
        shopId
      },
      payments
    }
  );

  return { errors, success };
}
