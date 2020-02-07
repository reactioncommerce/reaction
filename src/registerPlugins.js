/**
 * @summary A function in which you should call `register` function for each API plugin,
 *   in the order in which you want to register them.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {Promise<null>} Null
 */
export default {
  /**
   * CORE
   */
  registerSimpleSchemaPlugin: "./plugins/simple-schema/index.js", // REQUIRED
  registerJobQueuePlugin: "./plugins/job-queue/index.js", // REQUIRED
  registerFilesPlugin: "./core-services/files/index.js", // REQUIRED
  registerShopPlugin: "./core-services/shop/index.js", // REQUIRED
  registerSettingsPlugin: "./core-services/settings/index.js", // REQUIRED
  registerI18nPlugin: "./core-services/i18n/index.js", // REQUIRED
  registerEmailPlugin: "./core-services/email/index.js", // REQUIRED
  registerAddressPlugin: "./core-services/address/index.js", // REQUIRED
  registerTranslationsPlugin: "./plugins/translations/index.js", // OPTIONAL
  registerSystemInformationPlugin: "./plugins/system-info/index.js", // OPTIONAL

  /**
   * Email
   */
  registerEmailTemplatesPlugin: "./plugins/email-templates/index.js", // OPTIONAL
  registerSMTPEmailPlugin: "./plugins/email-smtp/index.js", // OPTIONAL

  /**
   * Accounts
   */
  registerAccountsPlugin: "./core-services/account/index.js", // REQUIRED

  /**
   * Authentication and Authorization
   */
  registerAuthenticationPlugin: "./plugins/authentication/index.js", // REQUIRED
  // registerAuthorizationPlugin: "@reactioncommerce/reaction-plugin-authorization", // REQUIRED // TODO(pod-auth): uncomment when `reaction-plugin-authorization` when available
  registerLegacyAuthorizationPlugin: "./plugins/legacy-authorization/index.js", // REQUIRED

  /**
   * Catalog
   */
  registerProductPlugin: "./core-services/product/index.js", // REQUIRED
  registerCatalogPlugin: "./core-services/catalog/index.js", // REQUIRED
  registerTagsPlugin: "./core-services/tags/index.js", // REQUIRED

  /**
   * Pricing
   */
  registerSimplePricingPlugin: "./plugins/simple-pricing/index.js", // OPTIONAL

  /**
   * Inventory
   */
  registerInventoryPlugin: "./core-services/inventory/index.js", // REQUIRED
  registerSimpleInventoryPlugin: "./plugins/simple-inventory/index.js", // OPTIONAL

  /**
   * Cart
   */
  registerCartPlugin: "./core-services/cart/index.js", // REQUIRED

  /**
   * Orders
   */
  registerOrdersPlugin: "./core-services/orders/index.js", // REQUIRED

  /**
   * Payments
   */
  registerPaymentsPlugin: "./core-services/payments/index.js", // REQUIRED
  registerExamplePaymentsPlugin: "./plugins/payments-example/index.js", // OPTIONAL
  registerStripePaymentsPlugin: "./plugins/payments-stripe/index.js", // OPTIONAL

  /**
   * Discounts
   */
  registerDiscountsPlugin: "./core-services/discounts/index.js", // REQUIRED
  registerDiscountCodesPlugin: "./plugins/discount-codes/index.js", // OPTIONAL

  /**
   * Surcharges
   */
  registerSurchargesPlugin: "./plugins/surcharges/index.js", // OPTIONAL

  /**
   * Shipping
   */
  registerShippingPlugin: "./core-services/shipping/index.js", // REQUIRED
  registerShippingRatesPlugin: "./plugins/shipping-rates/index.js", // OPTIONAL

  /**
   * Taxes
   */
  registerTaxesPlugin: "./core-services/taxes/index.js", // REQUIRED
  registerTaxesRatesPlugin: "./plugins/taxes-rates/index.js", // OPTIONAL

  /**
   * Navigation
   */
  registerNavigationPlugin: "./plugins/navigation/index.js", // OPTIONAL
  registerSitemapGeneratorPlugin: "./plugins/sitemap-generator/index.js", // OPTIONAL

  /**
   * Miscellaneous
   */
  registerNotificationsPlugin: "./plugins/notifications/index.js", // OPTIONAL
  registerTestAddressValidationPlugin: "./plugins/address-validation-test/index.js" // OPTIONAL
};
