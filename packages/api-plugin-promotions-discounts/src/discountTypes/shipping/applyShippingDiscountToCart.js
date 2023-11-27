import Logger from "@reactioncommerce/logger";
import _ from "lodash";
import pkg from "../../../package.json" assert { type: "json" };
import recalculateShippingDiscount from "../../utils/recalculateShippingDiscount.js";
import formatMoney from "../../utils/formatMoney.js";
import getEligibleShipping from "../../utils/getEligibleIShipping.js";
import calculateDiscountAmount from "../../utils/calculateDiscountAmount.js";
import recalculateQuoteDiscount from "../../utils/recalculateQuoteDiscount.js";
import checkShippingStackable from "./checkShippingStackable.js";


const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "shipping/applyShippingDiscountToCart.js"
};

/**
 * @summary Map discount record to shipping discount
 * @param {Object} params - The action parameters
 * @param {Object} discountedItem - The item that were discounted
 * @returns {Object} Shipping discount record
 */
export function createDiscountRecord(params, discountedItem) {
  const { promotion, actionParameters } = params;
  const shippingDiscount = {
    promotionId: promotion._id,
    discountType: actionParameters.discountType,
    discountCalculationType: actionParameters.discountCalculationType,
    discountValue: actionParameters.discountValue,
    discountMaxValue: actionParameters.discountMaxValue,
    dateApplied: new Date(),
    discountedItemType: "shipping",
    discountedAmount: discountedItem.amount,
    stackability: promotion.stackability,
    neverStackWithOtherShippingDiscounts: actionParameters.neverStackWithOtherShippingDiscounts
  };
  return shippingDiscount;
}

/**
 * @summary Get the discount amount for a discount item
 * @param {Object} context - The application context
 * @param {Number} totalShippingRate - The total shipping price
 * @param {Object} actionParameters - The action parameters
 * @returns {Number} - The discount amount
 */
export function getTotalShippingDiscount(context, totalShippingRate, actionParameters) {
  const { discountMaxValue } = actionParameters;

  const total = calculateDiscountAmount(context, totalShippingRate, actionParameters);
  if (typeof discountMaxValue === "number" && discountMaxValue > 0) {
    return Math.min(total, discountMaxValue);
  }
  return total;
}

/**
 * @summary Splits a discount across all shipping
 * @param {Array<Object>} cartShipping - The shipping to split the discount across
 * @param {Number} totalShippingRate - The total shipping price
 * @param {Number} discountAmount - The total discount to split
 * @returns {Array<Object>} undefined
 */
export function splitDiscountForShipping(cartShipping, totalShippingRate, discountAmount) {
  let discounted = 0;
  const discountedShipping = cartShipping.map((shipping, index) => {
    if (index !== cartShipping.length - 1) {
      const rate = shipping.shipmentMethod.rate || 0;
      const discount = formatMoney((rate / totalShippingRate) * discountAmount);
      discounted += discount;
      return { _id: shipping._id, amount: discount };
    }
    return { _id: shipping._id, amount: formatMoney(discountAmount - discounted) };
  });

  return discountedShipping.filter((shipping) => shipping.amount > 0);
}

/**
 * @summary Get the total shipping rate
 * @param {Array<Object>} cartShipping - The shipping array to get the total rate for
 * @returns {Number} - The total shipping rate
 */
export function getTotalShippingRate(cartShipping) {
  const totalRate = cartShipping
    .map((shipping) => {
      if (!shipping.shipmentMethod) return 0;
      return shipping.shipmentMethod.rate || 0;
    })
    .reduce((sum, price) => sum + price, 0);
  return totalRate;
}

/**
 * @summary Check if the shipping is eligible for the discount
 * @param {Object} shipping - The shipping object
 * @param {Object} discount - The discount object
 * @returns {Boolean} - Whether the item is eligible for the discount
 */
export function canBeApplyDiscountToShipping(shipping, discount) {
  const shippingDiscounts = shipping.discounts || [];
  if (shippingDiscounts.length === 0) return true;

  const containsDiscountNeverStackWithOrderItem = _.some(shippingDiscounts, "neverStackWithOtherShippingDiscounts");
  if (containsDiscountNeverStackWithOrderItem) return false;

  if (discount.neverStackWithOtherShippingDiscounts) return false;
  return true;
}

/**
 * @summary Estimate the shipment quote discount
 * @param {Object} context - The application context
 * @param {object} cart - The cart to apply the discount to
 * @param {Object} params - The parameters to apply
 * @returns {Promise<Boolean>} - Has affected shipping
 */
export async function estimateShipmentQuoteDiscount(context, cart, params) {
  const { actionParameters, promotion } = params;
  const filteredItems = await getEligibleShipping(context, cart.shipping, {
    ...actionParameters,
    estimateShipmentQuote: true
  });

  const shipmentQuotes = cart.shipping[0]?.shipmentQuotes || [];

  let affectedItemsLength = 0;
  for (const item of filteredItems) {
    const shipmentQuote = shipmentQuotes.find((quote) => quote.method._id === item.method._id);
    if (!shipmentQuote) continue;

    const canBeDiscounted = canBeApplyDiscountToShipping(shipmentQuote, promotion);
    if (!canBeDiscounted) continue;

    const shippingDiscount = createDiscountRecord(params, item);

    if (!shipmentQuote.discounts) shipmentQuote.discounts = [];
    // eslint-disable-next-line no-await-in-loop
    const canStackable = await checkShippingStackable(context, shipmentQuote, shippingDiscount);
    if (!canStackable) continue;

    shipmentQuote.discounts.push(shippingDiscount);

    affectedItemsLength += 1;
    recalculateQuoteDiscount(context, shipmentQuote, actionParameters);
  }

  return affectedItemsLength > 0;
}

/**
 * @summary Add the discount to the shipping record
 * @param {Object} context - The application context
 * @param {Object} params - The parameters to apply
 * @param {Object} cart - The cart to apply the discount to
 * @returns {Promise<void>} undefined
 */
export default async function applyShippingDiscountToCart(context, params, cart) {
  const { actionParameters } = params;

  if (!cart.shipping) cart.shipping = [];
  if (!cart.appliedPromotions) cart.appliedPromotions = [];

  const isEstimateAffected = await estimateShipmentQuoteDiscount(context, cart, params);

  const filteredShipping = await getEligibleShipping(context, cart.shipping, actionParameters);
  const totalShippingRate = getTotalShippingRate(filteredShipping);
  const totalShippingDiscount = getTotalShippingDiscount(context, totalShippingRate, actionParameters);
  const discountedItems = splitDiscountForShipping(filteredShipping, totalShippingRate, totalShippingDiscount);

  let discountedShippingCount = 0;
  for (const discountedItem of discountedItems) {
    const shipping = filteredShipping.find((item) => item._id === discountedItem._id);
    if (!shipping) continue;


    const canBeDiscounted = canBeApplyDiscountToShipping(shipping, params.promotion);
    if (!canBeDiscounted) continue;

    if (!shipping.discounts) shipping.discounts = [];

    const shippingDiscount = createDiscountRecord(params, discountedItem);

    shipping.discounts.push(shippingDiscount);

    recalculateShippingDiscount(context, shipping);
    discountedShippingCount += 1;
  }

  const affected = discountedShippingCount > 0;
  if (affected) {
    Logger.info(logCtx, "Saved Discount to cart");
  }

  const reason = !affected ? "No shippings were discounted" : undefined;
  return { cart, affected, reason, temporaryAffected: isEstimateAffected };
}
