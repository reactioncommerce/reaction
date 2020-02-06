/* npm package imports */
// import registerAuthorizationPlugin from "@reactioncommerce/reaction-plugin-authorization"; // TODO(pod-auth): npm install `reaction-plugin-authorization` when available

/* node-app imports */
/* core-services */
import registerAccountsPlugin from "./core-services/account/index.js";
import registerAddressPlugin from "./core-services/address/index.js";
import registerCatalogPlugin from "./core-services/catalog/index.js";
import registerCartPlugin from "./core-services/cart/index.js";
import registerDiscountsPlugin from "./core-services/discounts/index.js";
import registerEmailPlugin from "./core-services/email/index.js";
import registerI18nPlugin from "./core-services/i18n/index.js";
import registerInventoryPlugin from "./core-services/inventory/index.js";
import registerProductPlugin from "./core-services/product/index.js";
import registerSettingsPlugin from "./core-services/settings/index.js";
import registerOrdersPlugin from "./core-services/orders/index.js";
import registerPaymentsPlugin from "./core-services/payments/index.js";
import registerShippingPlugin from "./core-services/shipping/index.js";
import registerShopPlugin from "./core-services/shop/index.js";
import registerTagsPlugin from "./core-services/tags/index.js";
import registerTaxesPlugin from "./core-services/taxes/index.js";

/* plugins */
import registerAuthenticationPlugin from "./plugins/authentication/index.js";
import registerLegacyAuthorizationPlugin from "./plugins/legacy-authorization/index.js";
import registerDiscountCodesPlugin from "./plugins/discount-codes/index.js";
import registerEmailTemplatesPlugin from "./plugins/email-templates/index.js";
import registerExamplePaymentsPlugin from "./plugins/payments-example/index.js";
import registerJobQueuePlugin from "./plugins/job-queue/index.js";
import registerNavigationPlugin from "./plugins/navigation/index.js";
import registerNotificationsPlugin from "./plugins/notifications/index.js";
import registerShippingRatesPlugin from "./plugins/shipping-rates/index.js";
import registerSimpleInventoryPlugin from "./plugins/simple-inventory/index.js";
import registerSimplePricingPlugin from "./plugins/simple-pricing/index.js";
import registerSimpleSchemaPlugin from "./plugins/simple-schema/index.js";
import registerSitemapGeneratorPlugin from "./plugins/sitemap-generator/index.js";
import registerSMTPEmailPlugin from "./plugins/email-smtp/index.js";
import registerStripePaymentsPlugin from "./plugins/payments-stripe/index.js";
import registerSurchargesPlugin from "./plugins/surcharges/index.js";
import registerSystemInfoPlugin from "./plugins/system-info/index.js";
import registerTaxesRatesPlugin from "./plugins/taxes-rates/index.js";
import registerTestAddressValidationPlugin from "./plugins/address-validation-test/index.js";
import registerTranslationsPlugin from "./plugins/translations/index.js";

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
  await registerSimpleSchemaPlugin(app); // REQUIRED
  await registerJobQueuePlugin(app); // REQUIRED

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

  await registerShopPlugin(app); // REQUIRED
  await registerSettingsPlugin(app); // REQUIRED
  await registerI18nPlugin(app); // REQUIRED
  await registerEmailPlugin(app); // REQUIRED
  await registerAddressPlugin(app); // REQUIRED
  await registerTranslationsPlugin(app); // OPTIONAL
  await registerSystemInfoPlugin(app); // OPTIONAL

  /**
   * Email
   */
  await registerEmailTemplatesPlugin(app); // OPTIONAL
  await registerSMTPEmailPlugin(app); // OPTIONAL

  /**
   * Accounts
   */
  await registerAccountsPlugin(app); // REQUIRED

  /**
   * Authentication and Authorization
   */
  await registerAuthenticationPlugin(app); // REQUIRED
  // await registerAuthorizationPlugin(app); // REQUIRED // TODO(pod-auth): uncomment when `reaction-plugin-authorization` when available
  await registerLegacyAuthorizationPlugin(app); // REQUIRED

  /**
   * Catalog
   */
  await registerProductPlugin(app); // REQUIRED
  await registerCatalogPlugin(app); // REQUIRED
  await registerTagsPlugin(app); // REQUIRED

  /**
   * Pricing
   */
  await registerSimplePricingPlugin(app); // OPTIONAL

  /**
   * Inventory
   */
  await registerInventoryPlugin(app); // REQUIRED
  await registerSimpleInventoryPlugin(app); // OPTIONAL

  /**
   * Cart
   */
  await registerCartPlugin(app); // REQUIRED

  /**
   * Orders
   */
  await registerOrdersPlugin(app); // REQUIRED

  /**
   * Payments
   */
  await registerPaymentsPlugin(app); // REQUIRED
  await registerExamplePaymentsPlugin(app); // OPTIONAL
  await registerStripePaymentsPlugin(app); // OPTIONAL

  /**
   * Discounts
   */
  await registerDiscountsPlugin(app); // REQUIRED
  await registerDiscountCodesPlugin(app); // OPTIONAL

  /**
   * Surcharges
   */
  await registerSurchargesPlugin(app); // OPTIONAL

  /**
   * Shipping
   */
  await registerShippingPlugin(app); // REQUIRED
  await registerShippingRatesPlugin(app); // OPTIONAL

  /**
   * Taxes
   */
  await registerTaxesPlugin(app); // REQUIRED
  await registerTaxesRatesPlugin(app); // OPTIONAL

  /**
   * Navigation
   */
  await registerNavigationPlugin(app); // OPTIONAL
  await registerSitemapGeneratorPlugin(app); // OPTIONAL

  /**
   * Miscellaneous
   */
  await registerNotificationsPlugin(app); // OPTIONAL
  await registerTestAddressValidationPlugin(app); // OPTIONAL
}
