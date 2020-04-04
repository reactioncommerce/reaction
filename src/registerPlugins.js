/* npm package imports */
/* services */
import registerServiceAddressValidation from "@reactioncommerce/api-service-address-validation";

/* plugins */
import registerPluginAddressValidationTest from "@reactioncommerce/api-plugin-address-validation-test";
import registerPluginAuthentication from "@reactioncommerce/plugin-authentication";
import registerPluginDiscountCodes from "@reactioncommerce/plugin-discount-codes";
import registerPluginExamplePayments from "@reactioncommerce/plugin-payments-example";
import registerPluginNavigation from "@reactioncommerce/plugin-navigation";
import registerPluginSimpleAuthorization from "@reactioncommerce/plugin-simple-authorization";
import registerPluginSitemapGenerator from "@reactioncommerce/plugin-sitemap-generator";
import registerPluginSystemInformation from "@reactioncommerce/plugin-system-information";
import registerPluginTranslations from "@reactioncommerce/plugin-translations";

/* node-app imports */
/* core-services */
import registerServiceAccounts from "./core-services/account/index.js";
import registerServiceCatalog from "./core-services/catalog/index.js";
import registerServiceCart from "./core-services/cart/index.js";
import registerServiceDiscounts from "./core-services/discounts/index.js";
import registerServiceEmail from "./core-services/email/index.js";
import registerServiceI18n from "./core-services/i18n/index.js";
import registerServiceInventory from "./core-services/inventory/index.js";
import registerServiceProduct from "./core-services/product/index.js";
import registerServiceSettings from "./core-services/settings/index.js";
import registerServiceOrders from "./core-services/orders/index.js";
import registerServicePayments from "./core-services/payments/index.js";
import registerServiceShipping from "./core-services/shipping/index.js";
import registerServiceShop from "./core-services/shop/index.js";
import registerServiceTags from "./core-services/tags/index.js";
import registerServiceTaxes from "./core-services/taxes/index.js";

/* plugins */
import registerPluginEmailTemplates from "./plugins/email-templates/index.js";
import registerPluginJobQueue from "./plugins/job-queue/index.js";
import registerPluginNotifications from "./plugins/notifications/index.js";
import registerPluginShippingRates from "./plugins/shipping-rates/index.js";
import registerPluginSimpleInventory from "./plugins/simple-inventory/index.js";
import registerPluginSimplePricing from "./plugins/simple-pricing/index.js";
import registerPluginSimpleSchema from "./plugins/simple-schema/index.js";
import registerPluginSMTPEmail from "./plugins/email-smtp/index.js";
import registerPluginStripePayments from "./plugins/payments-stripe/index.js";
import registerPluginSurcharges from "./plugins/surcharges/index.js";
import registerPluginTaxesRates from "./plugins/taxes-rates/index.js";

/**
 * @summary A function in which you should call `register` function for each API plugin,
 *   in the order in which you want to register them.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {Promise<null>} Null
 */
export default async function registerPlugins(app) {
  /**
   * CORE
   */
  await registerPluginSimpleSchema(app); // REQUIRED
  await registerPluginJobQueue(app); // REQUIRED

  // We don't register the files plugin when running integration tests
  // because there are some problems with the way MongoDB closes change
  // stream watchers, which end up causing a lot of errors. This doesn't
  // happen when running the app because we don't constantly connect and
  // disconnect to different Mongo databases.
  //
  // Note: The import must stay here, too. If the package is imported at
  // the top of this file, then side effects will happen and cause problems.
  if (!process.env.REACTION_DISABLE_FILES_PLUGIN) {
    const { default: registerFilesPlugin } = await import("./core-services/files/index.js");
    await registerFilesPlugin(app);
  }

  await registerServiceShop(app); // REQUIRED
  await registerServiceSettings(app); // REQUIRED
  await registerServiceI18n(app); // REQUIRED
  await registerServiceEmail(app); // REQUIRED
  await registerServiceAddressValidation(app); // REQUIRED
  await registerPluginTranslations(app); // OPTIONAL
  await registerPluginSystemInformation(app); // OPTIONAL

  /**
   * Email
   */
  await registerPluginEmailTemplates(app); // OPTIONAL
  await registerPluginSMTPEmail(app); // OPTIONAL

  /**
   * Accounts
   */
  await registerServiceAccounts(app); // REQUIRED

  /**
   * Authentication and Authorization
   */
  await registerPluginAuthentication(app); // REQUIRED
  await registerPluginSimpleAuthorization(app); // REQUIRED

  /**
   * Catalog
   */
  await registerServiceProduct(app); // REQUIRED
  await registerServiceCatalog(app); // REQUIRED
  await registerServiceTags(app); // REQUIRED

  /**
   * Pricing
   */
  await registerPluginSimplePricing(app); // OPTIONAL

  /**
   * Inventory
   */
  await registerServiceInventory(app); // REQUIRED
  await registerPluginSimpleInventory(app); // OPTIONAL

  /**
   * Cart
   */
  await registerServiceCart(app); // REQUIRED

  /**
   * Orders
   */
  await registerServiceOrders(app); // REQUIRED

  /**
   * Payments
   */
  await registerServicePayments(app); // REQUIRED
  await registerPluginExamplePayments(app); // OPTIONAL
  await registerPluginStripePayments(app); // OPTIONAL

  /**
   * Discounts
   */
  await registerServiceDiscounts(app); // REQUIRED
  await registerPluginDiscountCodes(app); // OPTIONAL

  /**
   * Surcharges
   */
  await registerPluginSurcharges(app); // OPTIONAL

  /**
   * Shipping
   */
  await registerServiceShipping(app); // REQUIRED
  await registerPluginShippingRates(app); // OPTIONAL

  /**
   * Taxes
   */
  await registerServiceTaxes(app); // REQUIRED
  await registerPluginTaxesRates(app); // OPTIONAL

  /**
   * Navigation
   */
  await registerPluginNavigation(app); // OPTIONAL
  await registerPluginSitemapGenerator(app); // OPTIONAL

  /**
   * Miscellaneous
   */
  await registerPluginNotifications(app); // OPTIONAL
  await registerPluginAddressValidationTest(app); // OPTIONAL
}
