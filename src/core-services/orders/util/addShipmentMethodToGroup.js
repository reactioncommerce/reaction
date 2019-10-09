import ReactionError from "@reactioncommerce/reaction-error";
import xformOrderGroupToCommonOrder from "./xformOrderGroupToCommonOrder.js";

/**
 * @summary Sets `shipmentMethod` object for a fulfillment group
 * @param {Object} context An object containing the per-request state
 * @param {String} [accountId] ID of account that is placing or already did place the order
 * @param {Object} [billingAddress] The primary billing address for the order, if known
 * @param {String|null} [cartId] ID of the cart from which the order is being placed, if applicable
 * @param {String} currencyCode Currency code for all money values
 * @param {Number} discountTotal Calculated discount total
 * @param {Object} group The fulfillment group to be mutated
 * @param {String} orderId ID of existing or new order to which this group will belong
 * @param {String} selectedFulfillmentMethodId ID of the fulfillment method option chosen by the user
 * @returns {undefined}
 */
export default async function addShipmentMethodToGroup(context, {
  accountId,
  billingAddress,
  cartId,
  currencyCode,
  discountTotal,
  group,
  orderId,
  selectedFulfillmentMethodId
}) {
  const { collections, queries } = context;

  const commonOrder = await xformOrderGroupToCommonOrder({
    accountId,
    billingAddress,
    cartId,
    collections,
    currencyCode,
    group,
    orderId,
    discountTotal
  });

  // We are passing commonOrder in here, but we need the finalGroup.shipmentMethod data inside of final order, which doesn't get set until after this
  // but we need the data from this in order to set it
  const rates = await queries.getFulfillmentMethodsWithQuotes(commonOrder, context);
  const errorResult = rates.find((option) => option.requestStatus === "error");
  if (errorResult) {
    throw new ReactionError("invalid", errorResult.message);
  }

  const selectedFulfillmentMethod = rates.find((rate) => selectedFulfillmentMethodId === rate.method._id);
  if (!selectedFulfillmentMethod) {
    throw new ReactionError("invalid", "The selected fulfillment method is no longer available." +
      " Fetch updated fulfillment options and try creating the order again with a valid method.");
  }

  group.shipmentMethod = {
    _id: selectedFulfillmentMethod.method._id,
    carrier: selectedFulfillmentMethod.method.carrier,
    currencyCode,
    label: selectedFulfillmentMethod.method.label,
    group: selectedFulfillmentMethod.method.group,
    name: selectedFulfillmentMethod.method.name,
    handling: selectedFulfillmentMethod.handlingPrice,
    rate: selectedFulfillmentMethod.rate
  };
}
