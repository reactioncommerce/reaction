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
  simpleSchema: "./plugins/simple-schema/index.js", // REQUIRED
  jobQueue: "./plugins/job-queue/index.js", // REQUIRED
  files: "./core-services/files/index.js", // REQUIRED
  shop: "./core-services/shop/index.js", // REQUIRED
  settings: "./core-services/settings/index.js", // REQUIRED
  i18: "./core-services/i18n/index.js", // REQUIRED
  email: "./core-services/email/index.js", // REQUIRED
  address: "./core-services/address/index.js", // REQUIRED
  translations: "./plugins/translations/index.js", // OPTIONAL
  systemInfo: "./plugins/system-info/index.js", // OPTIONAL

  /**
   * Email
   */
  emailTemplates: "./plugins/email-templates/index.js", // OPTIONAL
  sMTPEmail: "./plugins/email-smtp/index.js", // OPTIONAL

  /**
   * Accounts
   */
  accounts: "./core-services/account/index.js", // REQUIRED

  /**
   * Authentication and Authorization
   */
  authentication: "./plugins/authentication/index.js", // REQUIRED
  // authorization: "@reactioncommerce/reaction-plugin-authorization", // REQUIRED // TODO(pod-auth): uncomment when `reaction-plugin-authorization` when available
  legacyAuthorization: "./plugins/legacy-authorization/index.js", // REQUIRED

  /**
   * Catalog
   */
  product: "./core-services/product/index.js", // REQUIRED
  catalog: "./core-services/catalog/index.js", // REQUIRED
  tags: "./core-services/tags/index.js", // REQUIRED

  /**
   * Pricing
   */
  simplePricing: "./plugins/simple-pricing/index.js", // OPTIONAL

  /**
   * Inventory
   */
  inventory: "./core-services/inventory/index.js", // REQUIRED
  simpleInventory: "./plugins/simple-inventory/index.js", // OPTIONAL

  /**
   * Cart
   */
  cart: "./core-services/cart/index.js", // REQUIRED

  /**
   * Orders
   */
  orders: "./core-services/orders/index.js", // REQUIRED

  /**
   * Payments
   */
  payments: "./core-services/payments/index.js", // REQUIRED
  examplePayments: "./plugins/payments-example/index.js", // OPTIONAL
  stripePayments: "./plugins/payments-stripe/index.js", // OPTIONAL

  /**
   * Discounts
   */
  discounts: "./core-services/discounts/index.js", // REQUIRED
  discountCodes: "./plugins/discount-codes/index.js", // OPTIONAL

  /**
   * Surcharges
   */
  surcharges: "./plugins/surcharges/index.js", // OPTIONAL

  /**
   * Shipping
   */
  shipping: "./core-services/shipping/index.js", // REQUIRED
  shippingRates: "./plugins/shipping-rates/index.js", // OPTIONAL

  /**
   * Taxes
   */
  taxes: "./core-services/taxes/index.js", // REQUIRED
  taxesRates: "./plugins/taxes-rates/index.js", // OPTIONAL

  /**
   * Navigation
   */
  navigation: "./plugins/navigation/index.js", // OPTIONAL
  sitemapGenerator: "./plugins/sitemap-generator/index.js", // OPTIONAL

  /**
   * Miscellaneous
   */
  notifications: "./plugins/notifications/index.js", // OPTIONAL
  testAddressValidation: "./plugins/address-validation-test/index.js" // OPTIONAL
};
