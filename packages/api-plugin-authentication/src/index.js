import pkg from "../package.json" assert { type: "json" };
import tokenMiddleware from "./util/tokenMiddleware.js";
import getAccounts from "./util/accountServer.js";

/**
 * @summary Registers the authentication plugin
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  const { accountsGraphQL } = await getAccounts(app);

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
      typeDefsObj: [accountsGraphQL.typeDefs],
      resolvers: accountsGraphQL.resolvers
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
