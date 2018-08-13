import graphql from "graphql.js";
import { Accounts } from "meteor/accounts-base";
import { Reaction } from "/client/api";
import updateFulfillmentOptionsForGroup from "./mutations/updateFulfillmentOptionsForGroup";

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
    updateFulfillmentOptionsForGroup: (variables) => {
      setTokenHeader();
      return client.mutate(updateFulfillmentOptionsForGroup)(variables);
    }
  }
};
