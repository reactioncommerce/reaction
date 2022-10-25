import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "canBeApplied.js"
};

/**
 * @summary check if a promotion can be applied to a cart
 * @param {Object} context - The application context
 * @param {Array<Object>} appliedPromotions - The promotions that have been applied to the cart
 * @param {Object} promotion - The promotion to check
 * @returns {{reason: string, qualifies: boolean}} - Whether the promotion can be applied to the cart
 */
export default async function canBeApplied(context, appliedPromotions, promotion) {
  if (!Array.isArray(appliedPromotions) || appliedPromotions.length === 0) {
    return { qualifies: true };
  }
  const { promotions: { qualifiers } } = context;
  for (const qualifier of qualifiers) {
    // eslint-disable-next-line no-await-in-loop
    const { qualifies, reason } = await qualifier(context, appliedPromotions, promotion);
    if (qualifies) continue;
    Logger.info({ ...logCtx, reason, promotion }, "Promotion disqualified");
    return { qualifies, reason };
  }
  return { qualifies: true, reason: "" };
}
