/**
 * @summary returns the saveListOfCarts function with context enclosed
 * @param {Object} context - The application context
 * @return {function} - The saveListOfCarts function
 */
export default function wrapper(context) {
  /**
   * @summary take a list of carts, fetch them and then call saveCart mutation them to recalculate promotions
   * @param {Array<String>} arrayOfCartIds - An array of cart ids
   * @return {undefined} undefined
   */
  async function saveListOfCarts(arrayOfCartIds) {
    const { collections: { Carts } } = context;
    for (const cartId of arrayOfCartIds) {
      // eslint-disable-next-line no-await-in-loop
      const cart = await Carts.findOne({ _id: cartId });
      context.mutations.saveCart(context, cart);
    }
  }
  return saveListOfCarts;
}
