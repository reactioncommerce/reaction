import ReactionError from "@reactioncommerce/reaction-error";
import CurrencyDefinitions from "./CurrencyDefinitions";

/**
 * @name getCurrencyDefinitionByCode
 * @method
 * @summary Get the currency definition for a currency code
 * @param {String} code The code that must match the `currency.code`
 * @returns {Object} A Currency object
 */
export default function getCurrencyDefinitionByCode(code) {
  if (!code) return null;

  const entry = CurrencyDefinitions[code];
  if (!entry) throw new ReactionError("invalid", `No currency definition found for ${code}`);

  return {
    ...entry,
    _id: code,
    code
  };
}
