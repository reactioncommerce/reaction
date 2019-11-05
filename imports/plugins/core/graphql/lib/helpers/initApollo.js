import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import { getOperationAST } from "graphql";
import { Reaction } from "/client/api";

const httpUrl = Reaction.absoluteUrl("graphql-beta");
const wsUrl = httpUrl.replace("http", "ws");

export const meteorAccountsLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("Meteor.loginToken");

  if (token) {
    operation.setContext(() => ({
      headers: {
        "meteor-login-token": token
      }
    }));
  }

  return forward(operation);
});

const link = ApolloLink.split(
  (operation) => {
    const operationAST = getOperationAST(operation.query, operation.operationName);
    return !!operationAST && operationAST.operation === "subscription";
  },
  new WebSocketLink({
    uri: wsUrl,
    options: {
      reconnect: true, // auto-reconnect
      connectionParams: {
        authToken: localStorage.getItem("Meteor.loginToken")
      }
    }
  }),
  meteorAccountsLink.concat(new HttpLink({ uri: httpUrl }))
);

/**
 * @name initApollo
 * @summary Initializes Apollo Client
 * @returns {Object} New ApolloClient
 */
export default function initApollo() {
  return new ApolloClient({
    link,
    cache: new InMemoryCache()
  });
}
