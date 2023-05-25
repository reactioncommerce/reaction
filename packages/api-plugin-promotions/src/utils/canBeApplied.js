import Logger from "@reactioncommerce/logger";
import pkg from "../../package.json" assert { type: "json" };


const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "canBeApplied.js"
};

/**
 * @summary check if a promotion can be applied to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart we are trying to apply the promotion to
 * @param {Array<Object>} params.appliedThe - The promotions already applied
 * @param {Object} params.promotion - The promotion we are trying to apply
 * @returns {{reason: string, qualifies: boolean}} - Whether the promotion can be applied to the cart
 */
export default async function canBeApplied(context, cart, { appliedPromotions, promotion }) {
  if (!Array.isArray(appliedPromotions) || appliedPromotions.length === 0) {
    return { qualifies: true };
  }
  const { promotions: { qualifiers } } = context;
  for (const qualifier of qualifiers) {
    // eslint-disable-next-line no-await-in-loop
    const { qualifies, reason } = await qualifier(context, cart, { appliedPromotions, promotion });
    if (qualifies) continue;
    Logger.info({ ...logCtx, reason, promotion }, "Promotion disqualified");
    return { qualifies, reason };
  }
  return { qualifies: true, reason: "" };
}
