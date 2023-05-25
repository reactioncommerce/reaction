/* eslint-disable no-await-in-loop */
import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import pkg from "../../package.json" assert { type: "json" };


const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "stackable.js"
};

/**
 * @summary check if a promotion is applicable to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart we are trying to apply the promotion to
 * @param {Array<Object>} params.appliedThe - The promotions already applied
 * @param {Object} params.promotion - The promotion we are trying to apply
 * @returns {{reason: string, qualifies: boolean}} - Whether the promotion can be applied to the cart
 */
export default async function stackable(context, cart, { appliedPromotions, promotion }) {
  const { promotions } = context;
  const stackabilityByKey = _.keyBy(promotions.stackabilities, "key");
  const permanentPromotions = appliedPromotions.filter((appliedPromotion) => !appliedPromotion.isTemporary);

  for (const appliedPromotion of permanentPromotions) {
    if (!appliedPromotion.stackability) continue;

    const stackabilityHandler = stackabilityByKey[promotion.stackability.key];
    const appliedStackabilityHandler = stackabilityByKey[appliedPromotion.stackability.key];

    const stackabilityResult = await stackabilityHandler.handler(context, cart, { promotion, appliedPromotion });
    const appliedStackabilityResult = await appliedStackabilityHandler.handler(context, cart, { promotion: appliedPromotion, appliedPromotion: promotion });

    if (!stackabilityResult || !appliedStackabilityResult) {
      Logger.info(logCtx, "Cart disqualified from promotion because stackability is not stackable");
      return { qualifies: false, reason: "Cart disqualified from promotion because stackability is not stackable" };
    }
  }

  return { qualifies: true, reason: "" };
}
