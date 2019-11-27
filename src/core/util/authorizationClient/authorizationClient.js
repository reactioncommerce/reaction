import { createRequire } from "module";
import gql from "graphql-tag";
import fetch from "node-fetch";
import config from "./config.js";

// esmodules doesn't allow name imports, so we need
// to use `require` for the meantime until these
// packages update to default exports
const require = createRequire(import.meta.url); // eslint-disable-line

const { curryN } = require("ramda");
const { ApolloClient } = require("apollo-client");
const { InMemoryCache } = require("apollo-cache-inmemory");
const { HttpLink } = require("apollo-link-http");

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: config.AUTHORIZATION_URL,
  fetch
});

const client = new ApolloClient({
  cache,
  link
});

const query = gql`
  query isAuthorized(
    $subject: String
    $resource: String
    $action: String
    $context: JSONObject
  ) {
    isAuthorized(
      flavor: glob
      input: {
        subject: $subject
        action: $action
        context: $context
        resource: $resource
      }
    ) {
      allowed
    }
  }
`;

/**
 * @name hasPermission
 * @param {Object} context App context
 * @param {Object} resource - resource user is trying to access
 * @param {Object} action - action user is trying to perform to be passed to in the GQL query
 * @param {Object} ketoContext - context data to verify permissions against
 * @returns {Boolean} - true/false
 */
export default async function hasPermission(context, resource, action, ketoContext) {
  // Build subject from Reaction `context.userId`
  const { userId } = context;
  const subject = `reaction:users:${userId}`;

  const queryVariables = {
    subject,
    resource,
    action,
    context: {
      ...ketoContext,
      owner: `reaction:users:${ketoContext.owner}`
    }
  };


  const res = await client.query({
    query,
    queryVariables,
    fetchPolicy: "no-cache"
  });

  return res.data.isAuthorized.allowed;
}

const upsertRoles = async ({subject, resource, action}) => {

  const mutationVariables = {subject, resource, action}
  const res = await client.mutate({
    mutation,
    mutationVariables,
    fetchPolicy: "no-cache"
  });
}

const hasPermissionCurried = curryN(2, hasPermission);

/**
 * @summary Get a `hasPermission` function bound to the current user context
 * @param {Object} context App context
 * @return {Function} hasPermission function
 */
export function getHasPermissionFunctionForUser(context) {
  return hasPermissionCurried(context);
}
