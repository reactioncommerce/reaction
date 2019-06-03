import mutations from "./mutations";
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
    label: "Navigation",
    name: "navigation",
    autoEnable: true,
    collections: {
      NavigationItems: {
        name: "NavigationItems"
      },
      NavigationTrees: {
        name: "NavigationTrees"
      }
    },
    graphQL: {
      schemas,
      resolvers
    },
    mutations,
    queries,
    registry: [
      {
        provides: ["settings"],
        label: "Navigation",
        description: "Manage navigation",
        route: "/dashboard/navigation",
        icon: "fa fa-bars",
        container: "core",
        template: "navigationDashboard",
        name: "navigation-dashboard",
        workflow: "navigationWorkflow",
        priority: 2,
        meta: {
          actionView: {
            dashboardSize: "lg"
          }
        }
      }
    ],
    layout: [{
      workflow: "navigationWorkflow",
      layout: "coreLayout",
      theme: "default",
      enabled: true,
      structure: {
        template: "navigationDashboard",
        layoutHeader: "NavBar",
        layoutFooter: "",
        notFound: "notFound",
        dashboardControls: "",
        dashboardHeaderControls: "",
        adminControlsFooter: "adminControlsFooter"
      }
    }]
  });
}
