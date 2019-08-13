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
    label: "Tags",
    name: "reaction-tags",
    icon: "fa fa-tag",
    collections: {
      Tags: {
        name: "Tags",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ name: 1 }, { name: "c2_name" }],
          [{ relatedTagIds: 1 }, { name: "c2_relatedTagIds" }],
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ slug: 1 }, { unique: true }]
        ]
      }
    },
    version: "1.0.0",
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    registry: [{
      label: "Tags",
      description: "Tag Management",
      icon: "fa fa-tag",
      name: "tag/settings",
      provides: ["settings"],
      workflow: "coreTagWorkflow",
      template: "tagSettings",
      meta: {
        actionView: {
          dashboardSize: "md"
        }
      }
    }, {
      route: "tag/admin",
      label: "Tag Admin",
      permission: "tagAdmin",
      name: "tag/admin"
    }, {
      route: "tag/edit",
      label: "Edit Tag",
      permission: "tagEdit",
      name: "tag/edit"
    }],
    layout: [{
      layout: "coreLayout",
      workflow: "coreTagWorkflow",
      theme: "default",
      enabled: true,
      structure: {
        template: "tagSettings",
        layoutHeader: "NavBar",
        layoutFooter: "",
        notFound: "notFound",
        dashboardHeader: "dashboardHeader",
        dashboardControls: "dashboardControls",
        adminControlsFooter: "adminControlsFooter"
      }
    }]
  });
}
