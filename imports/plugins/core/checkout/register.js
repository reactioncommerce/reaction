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
