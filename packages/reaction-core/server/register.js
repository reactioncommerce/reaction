/*
 * register reaction core components as reaction packages
 */

ReactionCore.registerPackage = function (packageInfo) {
  let registeredPackage = ReactionRegistry.Packages[packageInfo.name] =
    packageInfo;
  return registeredPackage;
};

ReactionCore.registerPackage({
  label: "Core",
  name: "core",
  icon: "fa fa-th",
  autoEnable: true,
  settings: {
    public: {
      allowGuestCheckout: true
    },
    mail: {
      user: "",
      password: "",
      host: "localhost",
      port: "25"
    },
    openexchangerates: {
      appId: "",
      refreshPeriod: "every 1 hour"
    }
  },
  registry: [{
    route: "dashboard/shop",
    provides: "dashboard",
    label: "Core",
    description: "Reaction Commerce Core",
    icon: "fa fa-th",
    cycle: 1,
    container: "dashboard",
    permissions: [{
      label: "Dashboard",
      permission: "dashboard"
    }]
  }, {
    route: "dashboard",
    provides: "shortcut",
    label: "Dashboard",
    icon: "fa fa-th",
    cycle: 1
  }, {
    route: "dashboard/shop",
    template: "shopSettings",
    label: "Shop Settings",
    provides: "settings",
    icon: "fa fa-cog fa-2x fa-fw",
    container: "dashboard"
  }, {
    route: "dashboard/import",
    provides: "dashboard",
    label: "Import",
    description: "Support for imports and migrations.",
    icon: "fa fa-upload",
    cycle: 3
  }, {
    route: "dashboard/orders",
    provides: "dashboard",
    label: "Orders",
    description: "Fulfill your orders",
    icon: "fa fa-sun-o",
    cycle: 1,
    container: "orders"
  }, {
    route: "dashboard/orders",
    provides: "shortcut",
    label: "Orders",
    description: "Fulfill your orders",
    icon: "fa fa-sun-o",
    cycle: 1
  }, {
    template: "coreOrderWidgets",
    provides: "widget",
    route: "dashboard/orders"
  }, {
    route: "createProduct",
    label: "Add Product",
    icon: "fa fa-plus",
    provides: "shortcut"
  }],
  layout: [{ // coreLayout definitions
    layout: "coreLayout",
    provides: "coreLayout",
    theme: "default",
    enabled: true
  }, {
    layout: "coreLayout",
    provides: "coreCartWorkflow",
    collection: "Cart",
    theme: "default",
    enabled: true
  }, {
    layout: "coreLayout",
    provides: "coreOrderWorkflow",
    collection: "Orders",
    theme: "default",
    enabled: true
  }, {
    layout: "coreLayout",
    provides: "coreOrderShipmentWorkflow",
    collection: "Orders",
    theme: "default",
    enabled: true
  }, { // Standard Checkout Workflow
    template: "checkoutLogin",
    label: "Login",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-main",
    audience: ["guest", "anonymous"],
    priority: 1,
    position: "1"
  }, {
    template: "checkoutAddressBook",
    label: "Shipping Billing",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-main",
    audience: ["guest", "anonymous"],
    priority: 2,
    position: "2"
  }, {
    template: "coreCheckoutShipping",
    label: "Shipping Options",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-main",
    audience: ["guest", "anonymous"],
    priority: 3,
    position: "3"
  }, {
    template: "checkoutReview",
    label: "Review Payment",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-side",
    audience: ["guest", "anonymous"],
    priority: 4,
    position: "4"
  }, {
    template: "checkoutPayment",
    label: "Complete",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-side",
    audience: ["guest", "anonymous"],
    priority: 5,
    position: "5"
  }, {
    template: "coreOrderProcessing",
    label: "Order Processing",
    status: "processing",
    workflow: "coreOrderWorkflow",
    audience: ["dashboard/orders"]
  }, {
    template: "coreOrderCompleted",
    label: "Order Completed",
    status: "completed",
    workflow: "coreOrderWorkflow",
    audience: ["dashboard/orders"]
  }, { // Standard Order Fulfillment with shipping
    template: "coreOrderShippingSummary",
    label: "Summary",
    workflow: "coreOrderShipmentWorkflow",
    audience: ["dashboard/orders"]
  }, {
    template: "coreOrderShippingInvoice",
    label: "Invoice",
    workflow: "coreOrderShipmentWorkflow",
    audience: ["dashboard/orders"]
  }, {
    template: "coreOrderShippingTracking",
    label: "Shipment Tracking",
    workflow: "coreOrderShipmentWorkflow",
    audience: ["dashboard/orders"]
  }]
});
