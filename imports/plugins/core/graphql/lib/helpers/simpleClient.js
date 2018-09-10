import graphql from "graphql.js";
import { Accounts } from "meteor/accounts-base";
import { Reaction } from "/client/modules/core";
import updateFulfillmentOptionsForGroup from "../mutations/updateFulfillmentOptionsForGroup.graphql";
import createFlatRateFulfillmentMethod from "../mutations/createFlatRateFulfillmentMethod.graphql";
import updateFlatRateFulfillmentMethod from "../mutations/updateFlatRateFulfillmentMethod.graphql";
import deleteFlatRateFulfillmentMethod from "../mutations/deleteFlatRateFulfillmentMethod.graphql";
import placeOrderWithStripeCardPayment from "../mutations/placeOrderWithStripeCardPayment.graphql";

/**
 * In React components, you should use Apollo. This client is available for Blaze
 * components and other code, but ideally we will not need this forever.
 */

const client = graphql(Reaction.absoluteUrl("graphql-alpha"), { asJSON: true });

/**
 * @summary Sets the meteor-login-token header for all GraphQL requests done
 *   through simpleClient.
 * @returns {undefined}
 * @private
 */
function setTokenHeader() {
  const token = Accounts._storedLoginToken();
  if (token) {
    client.headers({ "meteor-login-token": token });
  } else {
    client.headers({});
  }
}

export default {
  mutations: {
    createFlatRateFulfillmentMethod: (variables) => {
      setTokenHeader();
      return client.mutate(createFlatRateFulfillmentMethod)(variables);
    },
    deleteFlatRateFulfillmentMethod: (variables) => {
      setTokenHeader();
      return client.mutate(deleteFlatRateFulfillmentMethod)(variables);
    },
    placeOrderWithStripeCardPayment: (variables) => {
      setTokenHeader();
      return client.mutate(placeOrderWithStripeCardPayment)(variables);
    },
    updateFlatRateFulfillmentMethod: (variables) => {
      setTokenHeader();
      return client.mutate(updateFlatRateFulfillmentMethod)(variables);
    },
    updateFulfillmentOptionsForGroup: (variables) => {
      setTokenHeader();
      return client.mutate(updateFulfillmentOptionsForGroup)(variables);
    }
  }
};
