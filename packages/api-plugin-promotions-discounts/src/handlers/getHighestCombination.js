import _ from "lodash";

/**
 * @summary get the total discount on the cart
 * @param {Object} cart - The cart to apply the promotion to
 * @returns {Number} - The total discount on the cart
 */
function getTotalDiscountOnCart(cart) {
  return cart.items.map((item) => (item.subtotal.discount || 0)).reduce((pv, cv) => pv + cv, 0);
}

/**
 * @summary get the highest combination of promotions
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply the promotion to
 * @param {Object} combinations - The combinations to compare
 * @returns {Promise<Array<Object>>} - The highest combination
 */
export default async function getHighestCombination(context, cart, combinations) {
  const { promotions: { enhancers, utils } } = context;

  const tasks = combinations.map(async (combinationPromotions) => {
    let copiedCart = _.cloneDeep(cart);
    for (const promo of combinationPromotions) {
      // eslint-disable-next-line no-await-in-loop
      const { affected, temporaryAffected } = await utils.actionHandler(context, copiedCart, promo);
      if (!affected || temporaryAffected) continue;
      copiedCart = utils.enhanceCart(context, enhancers, copiedCart);
    }
    const totalDiscount = getTotalDiscountOnCart(copiedCart);
    return { totalDiscount, promotions: combinationPromotions };
  });
  const taskResults = await Promise.all(tasks);

  const highestResult = _.maxBy(taskResults, "totalDiscount");
  return highestResult.promotions;
}
