import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "System Information",
    name: "reaction-systeminfo",
    icon: "fa fa-info",
    graphQL: {
      resolvers,
      schemas
    },
    queries
  });
}
