/* node-app imports */
/* core-services */
import registerAccountsPlugin from "./core-services/account/index.js";
import registerCatalogPlugin from "./core-services/catalog/index.js";
import registerCartPlugin from "./core-services/cart/index.js";
import registerCorePlugin from "./core-services/core/index.js";
import registerDiscountsPlugin from "./core-services/discounts/index.js";
import registerEmailPlugin from "./core-services/email/index.js";
import registerFilesPlugin from "./core-services/files/index.js";
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
import registerAddressPlugin from "./plugins/address/index.js";
import registerCheckoutPlugin from "./plugins/checkout/index.js";
import registerDashboardPlugin from "./plugins/dashboard/index.js";
import registerDiscountCodesPlugin from "./plugins/discount-codes/index.js";
import registerEmailTemplatesPlugin from "./plugins/email-templates/index.js";
import registerExamplePaymentsPlugin from "./plugins/payments-example/index.js";
import registerJobQueuePlugin from "./plugins/job-queue/index.js";
import registerMarketplacePlugin from "./plugins/marketplace/index.js";
import registerNavigationPlugin from "./plugins/navigation/index.js";
import registerNotificationsPlugin from "./plugins/notifications/index.js";
import registerProductAdminPlugin from "./plugins/product-admin/index.js";
import registerProductVariantPlugin from "./plugins/product-variant/index.js";
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
import registerTemplatesPlugin from "./plugins/templates/index.js";
import registerTestAddressValidationPlugin from "./plugins/address-validation-test/index.js";
import registerUIPlugin from "./plugins/ui/index.js";

/**
 * @summary A function in which you should call `register` function for each API plugin,
 *   in the order in which you want to register them.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {Promise<null>} Null
 */
export default async function registerPlugins(app) {
  /**
   * CORE
   * (Core plugin needs Media collection, so files plugin must be first)
   */
  await registerSimpleSchemaPlugin(app); // REQUIRED
  await registerJobQueuePlugin(app); // REQUIRED
  await registerFilesPlugin(app); // REQUIRED
  await registerCorePlugin(app); // REQUIRED
  await registerShopPlugin(app); // REQUIRED
  await registerSettingsPlugin(app); // REQUIRED
  await registerI18nPlugin(app); // REQUIRED
  await registerEmailPlugin(app); // REQUIRED
  await registerAddressPlugin(app); // REQUIRED
  await registerDashboardPlugin(app); // REQUIRED
  await registerUIPlugin(app); // REQUIRED
  await registerSystemInfoPlugin(app); // OPTIONAL

  /**
   * Email
   */
  await registerTemplatesPlugin(app); // REQUIRED
  await registerEmailTemplatesPlugin(app); // OPTIONAL
  await registerSMTPEmailPlugin(app); // OPTIONAL

  /**
   * Accounts
   */
  await registerAccountsPlugin(app); // REQUIRED

  /**
   * Catalog
   */
  await registerProductPlugin(app); // REQUIRED
  await registerProductVariantPlugin(app); // REQUIRED
  await registerProductAdminPlugin(app); // REQUIRED
  await registerCatalogPlugin(app); // REQUIRED
  await registerTagsPlugin(app); // REQUIRED
  await registerCheckoutPlugin(app); // REQUIRED

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
  await registerMarketplacePlugin(app); // OPTIONAL
  await registerNotificationsPlugin(app); // OPTIONAL

  if (process.env.NODE_ENV === "development") {
    await registerTestAddressValidationPlugin(app);
  }
}
