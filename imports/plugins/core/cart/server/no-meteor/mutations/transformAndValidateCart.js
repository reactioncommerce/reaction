import Logger from "@reactioncommerce/logger";
import { Cart as CartSchema } from "/imports/collections/schemas";
import forEachPromise from "/imports/utils/forEachPromise";
import updateCartFulfillmentGroups from "../util/updateCartFulfillmentGroups";
import { cartTransforms } from "../registration";

const logCtx = { name: "cart", file: "transformAndValidateCart" };

/**
 * @summary Takes a new or updated cart, runs it through all registered transformations,
 *   and validates it. Throws an error if invalid. The cart object is mutated.
 * @param {Object} context - App context
 * @param {Object} cart - The cart to transform and validate
 * @returns {undefined}
 */
export default async function transformAndValidateCart(context, cart) {
  updateCartFulfillmentGroups(context, cart);

  let commonOrders;

  /**
   * @summary It's common for cart transform functions to need to convert the cart to CommonOrders,
   *   but we don't want to do it unless they need it. The first transform to call this will
   *   cause `commonOrders` to be built and subsequent calls will get that cached list
   *   unless they force a rebuild by setting `shouldRebuild` to `true`.
   * @return {Object[]} CommonOrders
   */
  async function getCommonOrders({ shouldRebuild = false } = {}) {
    if (!commonOrders || shouldRebuild) {
      commonOrders = await Promise.all(cart.shipping.map((group) =>
        context.queries.getCommonOrderForCartGroup(context, { cartId: cart._id, fulfillmentGroupId: group._id })));
    }
    return commonOrders;
  }

  // Run transformations registered by plugins, in priority order, in series.
  // Functions are expected to mutate the cart passed by reference.
  // In testing, `forEachPromise` performed much better than a for-of loop, and resulted
  // in more accurate elapsed `ms` values in the logs.
  await forEachPromise(cartTransforms, async (transformInfo) => {
    const startTime = Date.now();
    /* eslint-disable no-await-in-loop */
    await transformInfo.fn(context, cart, { getCommonOrders });
    /* eslint-enable no-await-in-loop */
    Logger.debug({ ...logCtx, cartId: cart._id, ms: Date.now() - startTime }, `Finished ${transformInfo.name} cart transform`);
  });

  CartSchema.validate(cart);
}
