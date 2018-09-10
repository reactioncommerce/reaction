import { check, Match } from "meteor/check";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name shipping/updateShipmentQuotes
 * @method
 * @memberof Shipping/Methods
 * @summary Gets shipping rates and updates the users cart methods
 * @param {String} cartId - cartId
 * @param {String} fulfillmentGroupId - The fulfillment group to update quotes for
 * @param {String} [cartToken] - The cart token, required if anonymous
 * @return {Object} Object with cart property
 */
export default function updateShipmentQuotesMethod(cartId, fulfillmentGroupId, cartToken) {
  check(cartId, String);
  check(fulfillmentGroupId, String);
  check(cartToken, Match.Maybe(String));
  this.unblock();

  const context = Promise.await(getGraphQLContextInMeteorMethod(Reaction.getUserId()));
  return context.mutations.fulfillment.updateFulfillmentOptionsForGroup(context, {
    cartId,
    cartToken,
    fulfillmentGroupId
  });
}
