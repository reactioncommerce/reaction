import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

Reaction.registerPackage({
  label: "Tags",
  name: "reaction-tags",
  icon: "fa fa-tag",
  autoEnable: true,
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
