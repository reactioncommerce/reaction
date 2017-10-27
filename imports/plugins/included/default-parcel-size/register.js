import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Default Parcel Size",
  name: "reaction-shipping-parcel-size",
  icon: "fa fa-truck-o",
  autoEnable: true,
  settings: {
    name: "Parcel Size",
    size: {
      enabled: false
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      route: "/shipping/size",
      name: "shipping",
      label: "Shipping",
      description: "Provide parcel size details",
      icon: "fa fa-truck",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      provides: ["shippingSettings"],
      name: "shipping/settings/parcelSize",
      label: "Parcel Dimensions",
      description: "Provide parcel size details",
      icon: "fa fa-truck",
      template: "parcelSizeSettings"
    }
  ]
});
