import accounting from "accounting-js";
import getEligibleItems from "../../utils/getEligibleItems.js";
import getTotalEligibleItemsAmount from "../../utils/getTotalEligibleItemsAmount.js";
import getTotalDiscountOnCart from "../../utils/getTotalDiscountOnCart.js";
import recalculateCartItemSubtotal from "../../utils/recalculateCartItemSubtotal.js";

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
    dateApplied: new Date(),
    discountedItemType: "item",
    discountedAmount,
    discountedItems
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
export function getCartTotalAmount(context, items, discount) {
  const merchandiseTotal = getTotalEligibleItemsAmount(items);
  const { discountCalculationType, discountValue } = discount;
  const appliedDiscount = context.discountCalculationMethods[discountCalculationType](discountValue, merchandiseTotal);
  return Number(accounting.toFixed(appliedDiscount, 2));
}

/**
 * @summary Splits a discount across all cart items
 * @param {Number} totalDiscount - The total discount to split
 * @param {Array<Object>} cartItems - The cart items to split the discount across
 * @returns {void} undefined
 */
export function splitDiscountForCartItems(totalDiscount, cartItems) {
  const totalItemPrice = cartItems.reduce((acc, item) => acc + item.subtotal.amount, 0);
  const discountForEachItems = cartItems.map((item) => {
    const discount = (item.subtotal.amount / totalItemPrice) * totalDiscount;
    return { _id: item._id, amount: Number(accounting.toFixed(discount, 2)) };
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
  const discountAmount = getCartTotalAmount(context, filteredItems, actionParameters);
  const discountedItems = splitDiscountForCartItems(discountAmount, filteredItems);

  cart.discounts.push(createDiscountRecord(params, discountedItems, discountAmount));

  for (const discountedItem of discountedItems) {
    const cartItem = cart.items.find(({ _id }) => _id === discountedItem._id);
    if (cartItem) {
      cartItem.discounts.push(createDiscountRecord(params, undefined, discountedItem.amount));
      recalculateCartItemSubtotal(context, cartItem);
    }
  }

  cart.discount = getTotalDiscountOnCart(cart);

  return { cart };
}
