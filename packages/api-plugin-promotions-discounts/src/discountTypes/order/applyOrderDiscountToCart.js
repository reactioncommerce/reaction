import _ from "lodash";
import formatMoney from "../../utils/formatMoney.js";
import getEligibleItems from "../../utils/getEligibleItems.js";
import getTotalEligibleItemsAmount from "../../utils/getTotalEligibleItemsAmount.js";
import getTotalDiscountOnCart from "../../utils/getTotalDiscountOnCart.js";
import recalculateCartItemSubtotal from "../../utils/recalculateCartItemSubtotal.js";
import calculateDiscountAmount from "../../utils/calculateDiscountAmount.js";

/**
 * @summary Map discount record to cart discount
 * @param {Object} params - The action parameters
 * @param {Array<Object>} discountedItems - The items that were discounted
 * @param {Number} discountedAmount - The total amount discounted
 * @returns {Object} Cart discount record
 */
export function createDiscountRecord(params, discountedItems, discountedAmount) {
  const { promotion, actionParameters } = params;
  const itemDiscount = {
    promotionId: promotion._id,
    discountType: actionParameters.discountType,
    discountCalculationType: actionParameters.discountCalculationType,
    discountValue: actionParameters.discountValue,
    discountMaxValue: actionParameters.discountMaxValue,
    dateApplied: new Date(),
    discountedItemType: "item",
    discountedAmount,
    discountedItems,
    stackability: promotion.stackability
  };
  return itemDiscount;
}

/**
 * @summary Get the discount amount for a discount item
 * @param {Object} context - The application context
 * @param {Array<Object>} items - The cart to calculate the discount for
 * @param {Object} discount - The discount to calculate the discount amount for
 * @returns {Number} - The discount amount
 */
export function getCartDiscountAmount(context, items, discount) {
  const totalEligibleItemsAmount = getTotalEligibleItemsAmount(items);
  const { discountMaxValue } = discount;
  const cartDiscountedAmount = calculateDiscountAmount(context, totalEligibleItemsAmount, discount);
  const discountAmount = formatMoney(totalEligibleItemsAmount - cartDiscountedAmount);
  if (typeof discountMaxValue === "number" && discountMaxValue > 0) {
    return Math.min(discount.discountMaxValue, discountAmount);
  }
  return discountAmount;
}

/**
 * @summary Splits a discount across all cart items
 * @param {Number} discountAmount - The total discount to split
 * @param {Array<Object>} cartItems - The cart items to split the discount across
 * @returns {void} undefined
 */
export function splitDiscountForCartItems(discountAmount, cartItems) {
  const totalAmount = _.sumBy(cartItems, "subtotal.amount");
  let discounted = 0;
  const discountForEachItems = cartItems.map((item, index) => {
    if (index !== cartItems.length - 1) {
      const discount = formatMoney((item.subtotal.amount / totalAmount) * discountAmount);
      discounted += discount;
      return { _id: item._id, amount: discount };
    }

    return { _id: item._id, amount: formatMoney(discountAmount - discounted) };
  });

  return discountForEachItems;
}

/**
 * @summary Apply the order discount to the cart
 * @param {Object} context - The application context
 * @param {Object} params - The action parameters
 * @param {Object} cart - The cart to apply the discount to
 * @returns {Promise<Object>} The updated cart
 */
export default async function applyOrderDiscountToCart(context, params, cart) {
  cart.discounts = cart.discounts || [];
  const { actionParameters } = params;

  const filteredItems = await getEligibleItems(context, cart.items, actionParameters);
  const discountedAmount = getCartDiscountAmount(context, filteredItems, actionParameters);
  const discountedItems = splitDiscountForCartItems(discountedAmount, filteredItems);

  cart.discounts.push(createDiscountRecord(params, discountedItems, discountedAmount));

  for (const discountedItem of discountedItems) {
    const cartItem = cart.items.find(({ _id }) => _id === discountedItem._id);
    if (cartItem) {
      cartItem.discounts.push(createDiscountRecord(params, undefined, discountedItem.amount));
      recalculateCartItemSubtotal(context, cartItem);
    }
  }

  cart.discount = getTotalDiscountOnCart(cart);

  const affected = discountedItems.length > 0;
  const reason = !affected ? "No items were discounted" : undefined;

  return { cart, affected, reason };
}
