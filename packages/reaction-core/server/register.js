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
    },
    paymentMethod: {
      defaultPaymentMethod: ""
    }
  },
  registry: [{
    provides: "dashboard",
    label: "Core",
    description: "Reaction Core configuration",
    icon: "fa fa-th",
    cycle: 0,
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
    cycle: 0
  }, {
    route: "dashboard/shop",
    template: "shopSettings",
    label: "Shop Settings",
    provides: "settings",
    container: "dashboard"
  }, {
    route: "dashboard/orders",
    provides: "dashboard",
    label: "Orders",
    description: "Fulfill your orders",
    icon: "fa fa-sun-o",
    cycle: 1,
    container: "orders",
    template: "orders"
  }, {
    route: "dashboard/orders",
    provides: "shortcut",
    label: "Orders",
    description: "Fulfill your orders",
    icon: "fa fa-sun-o",
    cycle: 1
  }, {
    route: "createProduct",
    label: "Add Product",
    icon: "fa fa-plus",
    provides: "shortcut"
  }],
  layout: [{ // Standard Checkout Workflow
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
    label: "Order Processing",
    status: "created",
    workflow: "coreOrderWorkflow",
    audience: ["dashboard/orders"]
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
  }, { // Standard Order Item workflow
    label: "Inventory Adjust",
    workflow: "coreOrderItemWorkflow",
    status: "inventoryAdjusted",
    audience: ["dashboard/orders"]
  }, {
    label: "Item Payment Captured",
    workflow: "coreOrderItemWorkflow",
    status: "captured",
    audience: ["dashboard/orders"]
  }, {
    label: "Item Ship",
    workflow: "coreOrderItemWorkflow",
    status: "shipped",
    audience: ["dashboard/orders"]
  }, {
    label: "Item Delivered",
    workflow: "coreOrderItemWorkflow",
    status: "completed",
    audience: ["dashboard/orders"]
  }]
});
