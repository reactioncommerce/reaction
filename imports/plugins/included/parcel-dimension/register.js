import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Parcel Dimensions",
  name: "reaction-shipping-parcel-size",
  icon: "fa fa-truck-o",
  autoEnable: true,
  settings: {
    name: "Parcel Size",
    dimension: {
      enabled: false
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      route: "/shipping/dimension",
      name: "shipping",
      label: "Shipping",
      description: "Provide parcel dimension details",
      icon: "fa fa-truck",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      provides: ["shippingSettings"],
      name: "shipping/settings/parcelDimension",
      label: "Parcel Dimensions",
      description: "Provide parcel dimension details",
      icon: "fa fa-truck",
      template: "parcelDimensionSettings"
    }
  ]
});
