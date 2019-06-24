import registerAccountsPlugin from "/imports/plugins/core/accounts/server/no-meteor/register";
import registerAddressPlugin from "/imports/plugins/core/address/server/no-meteor/register";
import registerCartPlugin from "/imports/plugins/core/cart/server/no-meteor/register";
import registerCatalogPlugin from "/imports/plugins/core/catalog/server/no-meteor/register";
import registerCorePlugin from "/imports/plugins/core/core/server/no-meteor/register";
import registerDiscountCodesPlugin from "/imports/plugins/included/discount-codes/server/no-meteor/register";
import registerDiscountsPlugin from "/imports/plugins/core/discounts/server/no-meteor/register";
import registerEmailTemplatesPlugin from "/imports/plugins/included/email-templates/server/register";
import registerExamplePaymentsPlugin from "/imports/plugins/included/payments-example/server/no-meteor/register";
import registerFilesPlugin from "/imports/plugins/core/files/server/no-meteor/register";
import registerI18nPlugin from "/imports/plugins/core/i18n/server/no-meteor/register";
import registerInventoryPlugin from "/imports/plugins/core/inventory/server/no-meteor/register";
import registerMarketplacePlugin from "/imports/plugins/included/marketplace/server/no-meteor/register";
import registerNavigationPlugin from "/imports/plugins/core/navigation/server/no-meteor/register";
import registerNotificationsPlugin from "/imports/plugins/included/notifications/server/no-meteor/register";
import registerOrdersPlugin from "/imports/plugins/core/orders/server/no-meteor/register";
import registerPaymentsPlugin from "/imports/plugins/core/payments/server/no-meteor/register";
import registerProductPlugin from "/imports/plugins/core/product/server/no-meteor/register";
import registerSettingsPlugin from "/imports/plugins/core/settings/server/register";
import registerShippingPlugin from "/imports/plugins/core/shipping/server/no-meteor/register";
import registerShippingRatesPlugin from "/imports/plugins/included/shipping-rates/server/no-meteor/register";
import registerSimpleInventoryPlugin from "/imports/plugins/included/simple-inventory/server/no-meteor/register";
import registerSimplePricingPlugin from "/imports/plugins/included/simple-pricing/server/no-meteor/register";
import registerSitemapGeneratorPlugin from "/imports/plugins/included/sitemap-generator/server/no-meteor/register";
import registerSMTPEmailPlugin from "/imports/plugins/included/email-smtp/server/no-meteor/register";
import registerStripePaymentsPlugin from "/imports/plugins/included/payments-stripe/server/no-meteor/register";
import registerSurchargesPlugin from "/imports/plugins/included/surcharges/server/no-meteor/register";
import registerSystemInfoPlugin from "/imports/plugins/core/system-info/server/no-meteor/register";
import registerTagsPlugin from "/imports/plugins/core/tags/server/no-meteor/register";
import registerTaxesPlugin from "/imports/plugins/core/taxes/server/no-meteor/register";
import registerTaxesRatesPlugin from "/imports/plugins/included/taxes-rates/server/no-meteor/register";
import registerTemplatesPlugin from "/imports/plugins/core/templates/server/no-meteor/register";
import registerTestAddressValidationPlugin from "/imports/plugins/included/address-validation-test/server/register";

/**
 * @summary A function in which you should call `register` function for each API plugin,
 *   in the order in which you want to register them.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {Promise<null>} Null
 */
export default async function registerPlugins(app) {
  /**
   * CORE
   * (Core plugin needs Media collection, so files plugin must be first)
   */
  await registerFilesPlugin(app); // REQUIRED
  await registerCorePlugin(app); // REQUIRED
  await registerSettingsPlugin(app); // REQUIRED
  await registerI18nPlugin(app); // REQUIRED
  await registerAddressPlugin(app); // REQUIRED
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
  await registerMarketplacePlugin(app); // OPTIONAL
  await registerNotificationsPlugin(app); // OPTIONAL

  if (process.env.NODE_ENV === "development") {
    await registerTestAddressValidationPlugin(app);
  }
}
