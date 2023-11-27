import pkg from "../package.json" assert { type: "json" };
import tokenMiddleware from "./util/tokenMiddleware.js";
import getAccounts from "./util/accountServer.js";
import wsAuthenticate from "./util/wsAuthenticate.js";

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
      graphQLContext: [({ req }) => accountsGraphQL.context({ req })],
      wsContext: [async (ctx, msg, args) => {
        const context = await accountsGraphQL.context({ ctx, msg, args });
        return {
          ...context,
          ...(await wsAuthenticate(ctx, msg, args))
        };
      }]
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
