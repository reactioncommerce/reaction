import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Marketplace",
  name: "reaction-marketplace",
  icon: "fa fa-globe",
  autoEnable: false,
  settings: {
    name: "Marketplace",
    enabled: true,
    shops: {
      enabledShopTypes: [{
        shopType: "merchant",
        active: true
      }, {
        shopType: "affiliate",
        active: false
      }],
      enabledPackagesByShopTypes: [{
        shopType: "merchant",
        enabledPackages: [
          "reaction-dashboard",
          "reaction-accounts",
          "reaction-orders",
          "reaction-connectors",
          "reaction-connectors-shopify",
          "reaction-product-admin",
          "product-detail-simple",
          "reaction-product-simple",
          "reaction-product-variant",
          "reaction-notification",
          "reaction-marketplace",
          "reaction-analytics",
          "reaction-inventory",
          "reaction-sms",
          "reaction-social",
          "reaction-stripe",
          "reaction-taxes",
          "discount-codes"]
      }, {
        shopType: "affiliate",
        enabledPackages: [
          "reaction-dashboard",
          "reaction-product-simple",
          "reaction-product-variant",
          "reaction-notification",
          "reaction-analytics",
          "reaction-sms"]
      }]
    },
    public: {
      allowMerchantSignup: false, // Merchants can sign up without an invite
      marketplaceNakedRoutes: true, // Routes to the primary marketplace shop should not use shop prefix
      merchantCart: false, // Unique cart for each merchant
      merchantFulfillment: true, // Fulfillment comes from merchant which supplies product
      merchantLocale: false, // Currency and Language come from active merchant shop
      // merchantLanguage: false, // Language comes from active merchant shop
      // merchantCurrency: false, // Currency comes from active merchant shop
      merchantTheme: false, // Theme comes from active merchant shop
      merchantShippingRates: false, // Each merchant defines their own shipping rates
      shopPrefix: "/shop" // The prefix for the shop URL
    }
  },
  registry: [{
    label: "Marketplace",
    icon: "fa fa-globe",
    provides: ["shopSettings"],
    container: "dashboard",
    template: "marketplaceShopSettings",
    showForShopTypes: ["primary"]
  }, {
    route: "shop/settings/shops",
    template: "MarketplaceShops",
    name: "marketplaceShops",
    label: "Marketplace Shops",
    icon: "fa fa-globe",
    provides: ["settings"],
    container: "dashboard",
    showForShopTypes: ["primary"],
    meta: {
      actionView: {
        dashboardSize: "lg"
      }
    },
    permissions: [{
      label: "Marketplace Shops",
      permission: "marketplaceShops"
    }]
  }, {
    // This provides the settings container for marketplaceMerchantSettings
    label: "My Shop Settings",
    icon: "fa fa-briefcase",
    provides: ["shopSettings"],
    container: "dashboard",
    template: "marketplaceMerchantSettings",
    hideForShopTypes: ["primary"]
  }]
});
