import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Payments",
  name: "reaction-payments",
  icon: "fa fa-credit-card",
  autoEnable: true,
  settings: {
    payments: {
      enabled: true
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      name: "payments",
      label: "Payments",
      description: "Payment Methods",
      icon: "fa fa-credit-card",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      label: "Payment Settings",
      icon: "fa fa-credit-card",
      name: "payment/settings",
      provides: ["settings"],
      template: "paymentSettings"
    }
  ]
});
