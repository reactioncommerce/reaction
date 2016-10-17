import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Product Detail Simple",
  name: "product-detail-simple",
  icon: "fa fa-cubes",
  autoEnable: true,
  registry: [{
    route: "/product/:handle/:variantId?",
    name: "product",
    template: "productDetailSimple",
    workflow: "coreProductWorkflow"
  }, {
    label: "Product Details",
    provides: "settings",
    route: "/product/:handle/:variantId?",
    container: "product",
    template: "ProductAdmin"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreProductWorkflow",
    collection: "Products",
    theme: "default",
    enabled: true,
    structure: {
      template: "productDetailSimple",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "productNotFound",
      dashboardHeader: "",
      dashboardControls: "productDetailDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
