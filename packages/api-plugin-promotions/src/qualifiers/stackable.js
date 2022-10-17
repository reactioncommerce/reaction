import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "stackable.js"
};

/**
 * @summary does promotion meet stackability requirements
 * @param {Object} context - The application context
 * @param {Array<Object>} appliedPromotions - The promotions already applied
 * @param {Object} promotion - The promotions we are trying to apply
 * @return {{reason: string, qualifies: boolean}} - If it qualifies and if it doesn't why not
 */
export default function stackable(context, appliedPromotions, promotion) {
  if (appliedPromotions[0].stackAbility === "none" || promotion.stackAbility === "none") {
    Logger.info(logCtx, "Cart disqualified from promotion because stack ability is none");
    return { qualifies: false, reason: "Cart disqualified from promotion because stack ability is none" };
  }
  return { qualifies: true, reason: "" };
}
