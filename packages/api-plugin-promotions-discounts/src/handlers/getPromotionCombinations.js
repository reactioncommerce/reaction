/* eslint-disable no-await-in-loop */
import _ from "lodash";

/**
 * @summary get the combination of promotions
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply the promotion to
 * @param {Array<Object>} promotions - The promotions to apply
 * @returns {Promise<Object>} - The combination of promotions
 */
export default async function getPromotionCombinations(context, cart, promotions) {
  const { promotions: { utils } } = context;

  const explicitPromotions = promotions.filter((promotion) => promotion.triggerType === "explicit");
  const implicitPromotions = promotions.filter((promotion) => promotion.triggerType === "implicit");

  const stack = [explicitPromotions];
  let combinations = [];

  while (stack.length > 0) {
    const combination = stack.pop();
    combinations.push(combination);

    const nextPosition = implicitPromotions.indexOf(_.last(combination)) + 1 || 0;
    // eslint-disable-next-line no-plusplus
    for (let position = nextPosition; position < implicitPromotions.length; position++) {
      const promotion = implicitPromotions[position];
      const { qualifies } = await utils.canBeApplied(context, cart, { appliedPromotions: combination, promotion });

      if (!stack.some((currentCombination) => currentCombination.length === 1 && currentCombination[0]._id === promotion._id)) {
        stack.push([promotion]);
      }

      if (qualifies) {
        const newCombination = [...combination, promotion];
        stack.push(newCombination);
        continue;
      }
    }
  }

  // remove combination if is a subset of another combinations
  combinations = _.uniqWith(combinations, _.isEqual);

  combinations = _.filter(
    combinations,
    (combination) =>
      !_.some(combinations, (anotherCombination) => {
        if (_.isEqual(combination, anotherCombination)) return false;
        return _.differenceBy(combination, anotherCombination, "_id").length === 0;
      })
  );

  return combinations;
}
