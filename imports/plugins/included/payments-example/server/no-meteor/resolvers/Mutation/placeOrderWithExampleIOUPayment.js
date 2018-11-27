import { decodeAddressOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/address";
import { decodeCartOpaqueId, decodeCartItemsOpaqueIds } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { decodeFulfillmentMethodOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/fulfillment";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import placeOrderWithExampleIOUPaymentMutation from "/imports/plugins/included/payments-example/server/no-meteor/mutations/placeOrderWithExampleIOUPayment";

/**
 * @name "Mutation.placeOrderWithExampleIOUPayment"
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the placeOrderWithExampleIOUPayment GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.order - The order input
 * @param {Object} args.input.payment - Payment info
 * @param {Object} args.input.payment.billingAddress - The billing address
 * @param {String} [args.input.payment.billingAddressId] - An ID to attach to this billing address. For tracking whether this is from a saved address.
 * @param {String} args.input.payment.fullName - The full name of the person who needs to eventually pay
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} PlaceOrderWithExampleIOUPaymentPayload
 */
export default async function placeOrderWithExampleIOUPayment(parentResult, { input }, context) {
  const { clientMutationId = null, order, payment } = input;
  const { cartId: opaqueCartId, fulfillmentGroups, shopId: opaqueShopId } = order;
  const { billingAddressId: opaqueBillingAddressId } = payment;

  const billingAddressId = opaqueBillingAddressId ? decodeAddressOpaqueId(opaqueBillingAddressId) : null;
  const cartId = opaqueCartId ? decodeCartOpaqueId(opaqueCartId) : null;
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const transformedFulfillmentGroups = fulfillmentGroups.map((group) => ({
    ...group,
    items: decodeCartItemsOpaqueIds(group.items),
    selectedFulfillmentMethodId: decodeFulfillmentMethodOpaqueId(group.selectedFulfillmentMethodId),
    shopId: decodeShopOpaqueId(group.shopId)
  }));

  const { orders, token } = await placeOrderWithExampleIOUPaymentMutation(context, {
    payment: {
      ...payment,
      billingAddressId
    },
    order: {
      ...order,
      cartId,
      fulfillmentGroups: transformedFulfillmentGroups,
      shopId
    }
  });

  return {
    clientMutationId,
    orders,
    token
  };
}
