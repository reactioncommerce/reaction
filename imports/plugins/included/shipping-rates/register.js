import Reaction from "/imports/plugins/core/core/server/Reaction";
import getFulfillmentMethodsWithQuotes from "./server/no-meteor/getFulfillmentMethodsWithQuotes";
import graphqlSchema from "./server/no-meteor/schema.graphql";
import graphqlResolvers from "./server/no-meteor/resolvers";
import mutations from "./server/no-meteor/mutations";

Reaction.registerPackage({
  label: "Shipping Rates",
  name: "reaction-shipping-rates",
  icon: "fa fa-truck-o",
  autoEnable: true,
  graphQL: {
    schemas: [graphqlSchema],
    resolvers: graphqlResolvers
  },
  mutations,
  functionsByType: {
    getFulfillmentMethodsWithQuotes: [getFulfillmentMethodsWithQuotes]
  },
  settings: {
    name: "Flat Rate Service",
    flatRates: {
      enabled: false
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      route: "/shipping/rates",
      name: "shipping",
      label: "Shipping",
      description: "Provide shipping rates",
      icon: "fa fa-truck",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      provides: ["shippingSettings"],
      name: "shipping/settings/flatRates",
      label: "Flat Rate",
      description: "Provide shipping rates",
      icon: "fa fa-truck",
      template: "ShippingRatesSettings"
    },
    {
      template: "flatRateCheckoutShipping",
      name: "shipping/flatRates",
      provides: ["shippingMethod"]
    }
  ]
});
