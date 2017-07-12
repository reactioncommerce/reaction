import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Marketplace",
  name: "reaction-marketplace",
  icon: "fa fa-globe",
  autoEnable: true,
  settings: {
    name: "Marketplace",
    enabled: true,
    public: {
      allowGuestSellers: true,
      allowMerchantSignup: false,
      merchantFulfillment: true
    }
  },
  registry: [{
    label: "Marketplace",
    icon: "fa fa-globe",
    provides: "shopSettings",
    container: "dashboard",
    template: "marketplaceShopSettings"
  }, {
    route: "shop/:shopId",
    name: "shop",
    template: "products",
    workflow: "coreProductWorkflow",
    priority: 1
  }, {
    // does this work?
    // override default shop settings
    route: "shop/settings",
    template: "sellerShopSettings",
    name: "sellerShopSettings",
    label: "Shop Settings",
    icon: "fa fa-th",
    provides: "shortcut",
    container: "dashboard",
    audience: ["seller"],
    priority: 1
  }]
});
