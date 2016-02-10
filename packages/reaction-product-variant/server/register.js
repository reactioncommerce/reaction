ReactionCore.registerPackage({
  label: "Products",
  name: "reaction-product-variant",
  icon: "fa fa-cubes",
  autoEnable: true,
  settings: {
    name: "Products"
  },
  registry: {
    route: "createProduct",
    label: "Add Product",
    icon: "fa fa-plus",
    template: "productDetail",
    provides: "shortcut"
  },
  layout: [{
    layout: "coreLayout",
    workflow: "coreProductWorkflow",
    collection: "Products",
    theme: "default",
    enabled: true,
    structure: {
      template: "productDetail",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "productNotFound",
      dashboardHeader: "",
      dashboardControls: "dashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }],
  permissions: [{
    label: "Create Product",
    permission: "createProduct",
    group: "Shop Settings"
  }]
});
