import { makeExecutableSchema } from "apollo-server";
import pkg from "../package.json";
import tokenMiddleware from "./util/tokenMiddleware.js";
import getAccounts from "./util/accountServer.js";

/**
 * @summary Registers the authentication plugin
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  const { accountsGraphQL } = await getAccounts(app);
  // Make schema from account-js resolvers
  const schema = makeExecutableSchema({
    typeDefs: accountsGraphQL.typeDefs,
    resolvers: accountsGraphQL.resolvers,
    schemaDirectives: accountsGraphQL.schemaDirectives
  });

  await app.registerPlugin({
    label: "Authentication",
    name: "authentication",
    autoEnable: true,
    version: pkg.version,
    functionsByType: {
      graphQLContext: [({ req }) => accountsGraphQL.context({ req })]
    },
    collections: {
      users: {
        name: "users"
      }
    },
    graphQL: {
      schemas: [schema]
    },
    expressMiddleware: [
      {
        route: "graphql",
        stage: "authenticate",
        fn: tokenMiddleware
      }
    ]
  });
}
