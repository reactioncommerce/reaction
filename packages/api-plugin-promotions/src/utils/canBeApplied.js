import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import _ from "lodash";

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
 * @param {Object} cart - The cart to check
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
