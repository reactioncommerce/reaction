import getSurcharges from "../getSurcharges.js";

/**
 * @summary Cart transformation function that sets surcharges on cart
 * @param {Object} context Startup context
 * @param {Object} cart The cart, which can be mutated.
 * @param {Object} options Options
 * @param {Function} options.getCommonOrders Call this to get CommonOrder objects for all the cart groups
 * @returns {undefined}
 */
export default async function setSurchargesOnCart(context, cart, { getCommonOrders }) {
  // This is a workaround for now because surcharge calculations sometimes need an account ID.
  // We eventually need to add accountId to CommonOrder instead.
  let contextWithAccount = { ...context };
  if (cart.accountId && !context.account) {
    const { Accounts } = context.collections;
    const account = await Accounts.findOne({ _id: cart.accountId });
    contextWithAccount = {
      ...context,
      account,
      accountId: cart.accountId
    };
  }

  // Merge surcharges from each shipping group
  const cartSurcharges = [];
  const commonOrders = await getCommonOrders();
  for (const commonOrder of commonOrders) {
    const appliedSurcharges = await getSurcharges(contextWithAccount, { commonOrder }); // eslint-disable-line

    // Push shippingGroup surcharges to cart surcharge array
    cartSurcharges.push(...appliedSurcharges);
  }

  cart.surcharges = cartSurcharges;
}
