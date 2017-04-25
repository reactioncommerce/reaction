import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Marketplace",
  name: "reaction-marketplace",
  icon: "fa fa-globe",
  autoEnable: true,
  settings: {
    name: "Marketplace",
    public: {
      allowGuestSellers: true
    }
  },
  registry: [
    // Settings are in Catalog settings
    {
      label: "Marketplace",
      icon: "fa fa-globe",
      provides: "catalogSettings",
      container: "dashboard",
      template: "marketplaceCatalogSettings"
    },
    {
      route: "shop/:shopId",
      name: "shop",
      template: "products",
      workflow: "coreProductWorkflow",
      priority: 1
    },
    {
      // override default shop settings
      route: "shop/settings",
      template: "sellerShopSettings",
      name: "sellerShopSettings",
      label: "Shop Settings",
      icon: "fa fa-th",
      provides: "shortcut",
      container: "dashboard",
      permissions: ["owner", "admin"],
      audience: ["seller"],
      priority: 1
    }
  ]
});
