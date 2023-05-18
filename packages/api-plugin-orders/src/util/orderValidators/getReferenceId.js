import _ from "lodash";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "@reactioncommerce/logger";

/**
 * @method getReferenceId
 * @summary Returns the referenceId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} cart - Cart object
 * @param {Object} order - Order object
 * @returns {String} referenceId
 */
export default async function getReferenceId(context, cart, order) {
  const { getFunctionsOfType } = context;
  let referenceId;
  const createReferenceIdFunctions = getFunctionsOfType("createOrderReferenceId");

  if (!createReferenceIdFunctions || createReferenceIdFunctions.length === 0) {
    // if the cart has a reference Id, and no custom function is created use that
    if (_.get(cart, "referenceId")) { // we want the else to fallthrough if no cart to keep the if/else logic simple
      ({ referenceId } = cart);
    } else {
      referenceId = Random.id();
    }
  } else {
    referenceId = await createReferenceIdFunctions[0](context, order, cart);
    if (typeof referenceId !== "string") {
      const errorName = "invalid-parameter";
      const errorMessage = "Non-string value for Reference Id";
      throw new ReactionError(errorName, errorMessage);
    }
    if (createReferenceIdFunctions.length > 1) {
      Logger.warn("More than one createOrderReferenceId function defined. Using first one defined");
    }
  }

  return referenceId;
}
