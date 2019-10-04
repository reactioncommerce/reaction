/* eslint camelcase: 0 */
import i18n from "./i18n/index.js";
import schemas from "./schemas/index.js";
import stripeCapturePayment from "./util/stripeCapturePayment.js";
import stripeCreateAuthorizedPayment from "./util/stripeCreateAuthorizedPayment.js";
import stripeCreateRefund from "./util/stripeCreateRefund.js";
import stripeListRefunds from "./util/stripeListRefunds.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Marketplace",
    name: "reaction-marketplace",
    i18n,
    collections: {
      SellerShops: {
        name: "SellerShops"
      }
    },
    graphQL: {
      schemas
    },
    paymentMethods: [{
      name: "marketplace_stripe_card",
      displayName: "Marketplace Stripe Card",
      functions: {
        capturePayment: stripeCapturePayment,
        createAuthorizedPayment: stripeCreateAuthorizedPayment,
        createRefund: stripeCreateRefund,
        listRefunds: stripeListRefunds
      }
    }],
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
      api_key: "",
      connectAuth: {},
      public: {
        allowMerchantSignup: false, // Merchants can sign up without an invite
        client_id: "",
        marketplaceNakedRoutes: true, // Routes to the primary marketplace shop should not use shop prefix
        merchantCart: false, // Unique cart for each merchant
        merchantFulfillment: true, // Fulfillment comes from merchant which supplies product
        merchantLocale: false, // Currency and Language come from active merchant shop
        // merchantLanguage: false, // Language comes from active merchant shop
        // merchantCurrency: false, // Currency comes from active merchant shop
        merchantTheme: false, // Theme comes from active merchant shop
        merchantShippingRates: false, // Each merchant defines their own shipping rates
        publishable_key: "",
        shopPrefix: "/shop" // The prefix for the shop URL
      }
    },
    registry: [
      {
        label: "Marketplace",
        icon: "fa fa-globe",
        provides: ["shopSettings"],
        container: "dashboard",
        template: "marketplaceShopSettings",
        showForShopTypes: ["primary"]
      },
      {
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
      },
      // This provides the settings container for marketplaceMerchantSettings
      {
        label: "My Shop Settings",
        icon: "fa fa-briefcase",
        provides: ["shopSettings"],
        container: "dashboard",
        template: "marketplaceMerchantSettings",
        hideForShopTypes: ["primary"]
      },

      // Settings panel
      {
        label: "Stripe for Marketplace",
        provides: ["paymentSettings"],
        container: "dashboard",
        template: "stripeMarketplaceSettings",
        hideForShopTypes: ["merchant", "affiliate"]
      },

      // Redirect for Stripe Connect Sign-In
      {
        route: "/stripe/connect/authorize",
        template: "stripeConnectAuthorize"
      },

      // Payment Signup for Merchants
      {
        label: "Stripe Merchant Account",
        icon: "fa fa-cc-stripe",
        container: "dashboard",
        provides: ["marketplaceMerchantSettings"],
        template: "stripeConnectMerchantSignup",
        hideForShopTypes: ["primary"]
      }
    ]
  });
}
