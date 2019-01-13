import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Checkout",
  name: "reaction-checkout",
  icon: "fa fa-shopping-cart",
  autoEnable: true,
  settings: {
    name: "Checkout"
  },
  registry: [{
    route: "/cart/completed/:_id?",
    name: "cart/completed",
    template: "cartCompleted",
    workflow: "coreCartWorkflow"
  }],
  layout: [{
    template: "checkoutLogin",
    label: "Login",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-main",
    audience: ["guest", "anonymous"],
    position: "1"
  }, {
    template: "checkoutAddressBook",
    label: "Shipping Billing",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-main",
    audience: ["guest", "anonymous"],
    position: "2"
  }, {
    template: "coreCheckoutShipping",
    label: "Shipping Options",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-main",
    audience: ["guest", "anonymous"],
    position: "3"
  }, {
    template: "checkoutReview",
    label: "Review Payment",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-side",
    audience: ["guest", "anonymous"],
    position: "4"
  }, {
    template: "checkoutPayment",
    label: "Complete",
    workflow: "coreCartWorkflow",
    container: "checkout-steps-side",
    audience: ["guest", "anonymous"],
    position: "5"
  }]
});
