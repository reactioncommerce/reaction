import getSurcharges from "./getSurcharges";
import mutations from "./mutations";
import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";
import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Surcharges",
    name: "reaction-surcharges",
    icon: "fa fa-icon-money",
    collections: {
      Surcharges: {
        name: "Surcharges",
        indexes: [
          [{ shopId: 1 }]
        ]
      }
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    functionsByType: {
      getSurcharges: [getSurcharges],
      startup: [startup]
    }
  });
}
