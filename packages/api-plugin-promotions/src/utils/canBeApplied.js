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
 * @param {Array<Object>} appliedPromotions - The promotions that have been applied to the cart
 * @param {Object} promotion - The promotion to check
 * @returns {Boolean} - Whether the promotion can be applied to the cart
 */
export default function canBeApplied(appliedPromotions, promotion) {
  if (!Array.isArray(appliedPromotions) || appliedPromotions.length === 0) {
    return true;
  }
  if (appliedPromotions[0].stackAbility === "none" || promotion.stackAbility === "none") {
    Logger.info(logCtx, "Cart disqualified from promotion because stack ability is none");
    return false;
  }
  return true;
}
