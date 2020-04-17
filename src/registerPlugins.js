/* npm package imports */
import registerPluginAccounts from "@reactioncommerce/api-plugin-accounts";
import registerPluginAddressValidation from "@reactioncommerce/api-plugin-address-validation";
import registerPluginAddressValidationTest from "@reactioncommerce/api-plugin-address-validation-test";
import registerPluginAuthentication from "@reactioncommerce/plugin-authentication";
import registerPluginCatalogs from "@reactioncommerce/api-plugin-catalogs";
import registerPluginDiscountCodes from "@reactioncommerce/plugin-discount-codes";
import registerPluginPaymentsExample from "@reactioncommerce/plugin-payments-example";
import registerPluginI18n from "@reactioncommerce/api-plugin-i18n";
import registerPluginNavigation from "@reactioncommerce/plugin-navigation";
import registerPluginNotifications from "@reactioncommerce/api-plugin-notifications";
import registerPluginSettings from "@reactioncommerce/api-plugin-settings";
import registerPluginShops from "@reactioncommerce/api-plugin-shops";
import registerPluginSimpleAuthorization from "@reactioncommerce/plugin-simple-authorization";
import registerPluginSitemapGenerator from "@reactioncommerce/plugin-sitemap-generator";
import registerPluginSimpleSchema from "@reactioncommerce/api-plugin-simple-schema";
import registerPluginSystemInformation from "@reactioncommerce/plugin-system-information";
import registerPluginTranslations from "@reactioncommerce/plugin-translations";

/* node-app imports */
/* core-services */
import registerPluginCart from "./core-services/cart/index.js";
import registerPluginDiscounts from "./core-services/discounts/index.js";
import registerPluginEmail from "./core-services/email/index.js";
import registerPluginInventory from "./core-services/inventory/index.js";
import registerPluginProduct from "./core-services/product/index.js";
import registerPluginOrders from "./core-services/orders/index.js";
import registerPluginPayments from "./core-services/payments/index.js";
import registerPluginShipping from "./core-services/shipping/index.js";
import registerPluginTags from "./core-services/tags/index.js";
import registerPluginTaxes from "./core-services/taxes/index.js";

/* plugins */
import registerPluginEmailTemplates from "./plugins/email-templates/index.js";
import registerPluginJobQueue from "./plugins/job-queue/index.js";
import registerPluginShippingRates from "./plugins/shipping-rates/index.js";
import registerPluginSimpleInventory from "./plugins/simple-inventory/index.js";
import registerPluginSimplePricing from "./plugins/simple-pricing/index.js";
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

  await registerPluginShops(app); // REQUIRED
  await registerPluginSettings(app); // REQUIRED
  await registerPluginI18n(app); // REQUIRED
  await registerPluginEmail(app); // REQUIRED
  await registerPluginAddressValidation(app); // REQUIRED
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
  await registerPluginAccounts(app); // REQUIRED

  /**
   * Authentication and Authorization
   */
  await registerPluginAuthentication(app); // REQUIRED
  await registerPluginSimpleAuthorization(app); // REQUIRED

  /**
   * Catalog
   */
  await registerPluginProduct(app); // REQUIRED
  await registerPluginCatalogs(app); // REQUIRED
  await registerPluginTags(app); // REQUIRED

  /**
   * Pricing
   */
  await registerPluginSimplePricing(app); // OPTIONAL

  /**
   * Inventory
   */
  await registerPluginInventory(app); // REQUIRED
  await registerPluginSimpleInventory(app); // OPTIONAL

  /**
   * Cart
   */
  await registerPluginCart(app); // REQUIRED

  /**
   * Orders
   */
  await registerPluginOrders(app); // REQUIRED

  /**
   * Payments
   */
  await registerPluginPayments(app); // REQUIRED
  await registerPluginPaymentsExample(app); // OPTIONAL
  await registerPluginStripePayments(app); // OPTIONAL

  /**
   * Discounts
   */
  await registerPluginDiscounts(app); // REQUIRED
  await registerPluginDiscountCodes(app); // OPTIONAL

  /**
   * Surcharges
   */
  await registerPluginSurcharges(app); // OPTIONAL

  /**
   * Shipping
   */
  await registerPluginShipping(app); // REQUIRED
  await registerPluginShippingRates(app); // OPTIONAL

  /**
   * Taxes
   */
  await registerPluginTaxes(app); // REQUIRED
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
