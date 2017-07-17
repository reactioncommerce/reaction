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
      allowGuestSellers: true, // TODO: Eliminate in favor of marketplace.enabled and allowMerchantSignup
      allowMerchantSignup: false, // Merchants can sign up without an invite
      marketplaceNakedRoutes: true, // Routes to the primary marketplace shop should not use shop prefix
      merchantFulfillment: true, // Fulfillment comes from merchant which supplies product
      merchantLanguage: false, // Language comes from active merchant shop
      merchantCurrency: false, // Currency comes from active merchant shop
      merchantTheme: false, // Theme comes from active merchant shop
      merchantShippingRates: false // Each merchant defines their own shipping rates
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
