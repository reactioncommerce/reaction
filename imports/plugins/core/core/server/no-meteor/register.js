/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Core",
    name: "core",
    icon: "fa fa-th",
    autoEnable: true,
    collections: {
      Packages: {
        name: "Packages",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ name: 1, shopId: 1 }],
          [{ "registry.provides": 1 }, { name: "c2_registry.$.provides" }]
        ]
      },
      Shops: {
        name: "Shops",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ domains: 1 }, { name: "c2_domains" }],
          [{ name: 1 }, { name: "c2_name" }],
          [{ slug: 1 }, { name: "c2_slug", sparse: true, unique: true }]
        ]
      },
      Themes: {
        name: "Themes"
      }
    },
    settings: {
      public: {
        allowGuestCheckout: true
      },
      mail: {
        user: "",
        password: "",
        host: "",
        port: ""
      },
      openexchangerates: {
        appId: "",
        refreshPeriod: "every 1 hour"
      },
      paymentMethod: {
        defaultPaymentMethod: ""
      }
    },
    layout: [{
      layout: "coreLayout",
      workflow: "coreWorkflow",
      theme: "default",
      enabled: true,
      structure: {
        template: "products",
        layoutHeader: "NavBar",
        layoutFooter: "Footer",
        notFound: "productNotFound",
        dashboardControls: "dashboardControls",
        adminControlsFooter: "adminControlsFooter"
      }
    }, {
      layout: "coreLayout",
      workflow: "coreWorkflow",
      theme: "default",
      enabled: true,
      structure: {
        template: "unauthorized",
        layoutHeader: "NavBar",
        layoutFooter: "Footer"
      }
    }]
  });
}
