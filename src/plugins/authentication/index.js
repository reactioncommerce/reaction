import mutations from "./mutations/index.js";
import tokenMiddleware from "./util/tokenMiddleware.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Authentication",
    name: "reaction-authentication",
    version: app.context.appVersion,
    collections: {
      users: {
        name: "users"
      }
    },
    mutations,
    expressMiddleware: [
      {
        route: "graphql",
        stage: "authenticate",
        fn: tokenMiddleware
      }
    ]
  });
}
