import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { Accounts } from "meteor/accounts-base";
import { Reaction } from "/client/api";

export const meteorAccountsLink = new ApolloLink((operation, forward) => {
  const token = Accounts._storedLoginToken();

  operation.setContext(() => ({
    headers: {
      "meteor-login-token": token
    }
  }));

  return forward(operation);
});

/**
 * @name initApollo
 * @summary Initializes Apollo Client
 * @returns {Object} New ApolloClient
 */
export default function initApollo() {
  return new ApolloClient({
    link: meteorAccountsLink.concat(new HttpLink({ uri: Reaction.absoluteUrl("graphql-alpha") })),
    cache: new InMemoryCache()
  });
}
