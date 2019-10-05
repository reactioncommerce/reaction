import SimpleSchema from "simpl-schema";

const withoutCodeCountries = ["AO", "AG", "AW", "BS", "BZ", "BJ", "BW",
  "BF", "BI", "CM", "CF", "KM", "CG", "CD", "CK", "CI", "DJ",
  "DM", "GQ", "ER", "FJ", "TF", "GM", "GH", "GD", "GN", "GY",
  "HK", "IE", "JM", "KE", "KI", "MO", "MW", "ML", "MR", "MU",
  "MS", "NR", "AN", "NU", "KP", "PA", "QA", "RW", "KN", "LC",
  "ST", "SA", "SC", "SL", "SB", "SO", "SR", "SY", "TZ", "TL",
  "TK", "TO", "TT", "TV", "UG", "AE", "VU", "YE", "ZW"];

/**
 * @name Metafield
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} key optional
 * @property {String} namespace optional
 * @property {String} scope optional
 * @property {String} value optional
 * @property {String} valueType optional
 * @property {String} description optional
 */
const Metafield = new SimpleSchema({
  key: {
    type: String,
    max: 30,
    optional: true
  },
  namespace: {
    type: String,
    max: 20,
    optional: true
  },
  scope: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  },
  valueType: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  }
});

/**
 * @name OrderAddress
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id
 * @property {String} fullName required
 * @property {String} firstName
 * @property {String} lastName
 * @property {String} address1 required
 * @property {String} address2
 * @property {String} city required
 * @property {String} company
 * @property {String} phone required
 * @property {String} region required, State/Province/Region
 * @property {String} postal required
 * @property {String} country required
 * @property {Boolean} isCommercial required
 * @property {Boolean} isBillingDefault required
 * @property {Boolean} isShippingDefault required
 * @property {Boolean} failedValidation
 * @property {Metafield[]} metafields
 */
export const OrderAddress = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "fullName": {
    type: String,
    label: "Full name"
  },
  "firstName": {
    type: String,
    label: "First name",
    optional: true
  },
  "lastName": {
    type: String,
    label: "Last name",
    optional: true
  },
  "address1": {
    label: "Address 1",
    type: String
  },
  "address2": {
    label: "Address 2",
    type: String,
    optional: true
  },
  "city": {
    type: String,
    label: "City"
  },
  "company": {
    type: String,
    label: "Company",
    optional: true
  },
  "phone": {
    type: String,
    label: "Phone"
  },
  "region": {
    label: "State/Province/Region",
    type: String
  },
  "postal": {
    label: "ZIP/Postal Code",
    type: String,
    optional: true,
    custom() {
      const country = this.field("country");
      if (country && country.value) {
        if (!withoutCodeCountries.includes(country.value) && !this.value) {
          return "required";
        }
      }
      return true;
    }
  },
  "country": {
    type: String,
    label: "Country"
  },
  "isCommercial": {
    label: "This is a commercial address.",
    type: Boolean,
    defaultValue: false
  },
  "isBillingDefault": {
    label: "Make this your default billing address?",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "isShippingDefault": {
    label: "Make this your default shipping address?",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "failedValidation": {
    label: "Failed validation",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  }
});

/**
 * @name SurchargeMessagesByLanguage
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} content optional
 * @property {String} language optional
 */
const SurchargeMessagesByLanguage = new SimpleSchema({
  content: String,
  language: String
});

/**
 * @name AppliedSurcharge
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id
 * @property {Money} amount
 * @property {String} cartId optional
 * @property {String} fulfillmentGroupId optional
 * @property {String} messagesByLanguage optional
 * @property {String} reason optional
 * @property {String} surchargeId optional
 */
const AppliedSurcharge = new SimpleSchema({
  "_id": String,
  "amount": Number,
  "cartId": {
    type: String,
    optional: true
  },
  "fulfillmentGroupId": {
    type: String,
    optional: true
  },
  /*
   * Message is used as a client message to let customers know why this surcharge might apply
   * It can be saved in various languages
  */
  "messagesByLanguage": {
    type: Array,
    optional: true
  },
  "messagesByLanguage.$": {
    type: SurchargeMessagesByLanguage
  },
  "surchargeId": {
    type: String,
    optional: true
  }
});

/**
 * @name ShippingParcel
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} containers optional
 * @property {Number} length optional
 * @property {Number} width optional
 * @property {Number} height optional
 * @property {Number} weight optional
 */
const ShippingParcel = new SimpleSchema({
  containers: {
    type: String,
    optional: true
  },
  length: {
    type: Number,
    optional: true
  },
  width: {
    type: Number,
    optional: true
  },
  height: {
    type: Number,
    optional: true
  },
  weight: {
    type: Number,
    optional: true
  }
});

const Money = new SimpleSchema({
  currencyCode: String,
  amount: {
    type: Number,
    min: 0
  }
});

/**
 * @name CommonOrderItemAttribute
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} label required
 * @property {String} value optional
 */
export const CommonOrderItemAttribute = new SimpleSchema({
  label: String,
  value: {
    type: String,
    optional: true
  }
});

export const CommonOrderItem = new SimpleSchema({
  "_id": String,
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": CommonOrderItemAttribute,
  "isTaxable": {
    type: Boolean,
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "price": Money,
  "productId": String,
  "productVendor": {
    type: String,
    optional: true
  },
  "quantity": {
    type: SimpleSchema.Integer,
    min: 0
  },
  "shopId": String,
  "subtotal": Money,
  "taxCode": {
    type: String,
    optional: true
  },
  "title": String,
  "variantId": String,
  "variantTitle": {
    type: String,
    optional: true
  }
});

const CommonOrderFulfillmentPrices = new SimpleSchema({
  handling: {
    type: Money,
    optional: true
  },
  shipping: {
    type: Money,
    optional: true
  },
  total: {
    type: Money,
    optional: true
  }
});

const CommonOrderTotals = new SimpleSchema({
  groupDiscountTotal: {
    type: Money,
    optional: true
  },
  groupItemTotal: {
    type: Money,
    optional: true
  },
  groupTotal: {
    type: Money,
    optional: true
  },
  orderDiscountTotal: {
    type: Money,
    optional: true
  },
  orderItemTotal: {
    type: Money,
    optional: true
  },
  orderTotal: {
    type: Money,
    optional: true
  }
});

/**
 * @type {SimpleSchema}
 * @summary The CommonOrder schema describes an order for a single shop, containing only
 *   properties that can be provided by a Cart as well. Each fulfillment group in a Cart
 *   or Order can be transformed into a single CommonOrder. This allows plugins that
 *   operate on both cart and order to provide only a single function, accepting a CommonOrder,
 *   where the caller can transform and store the result as necessary for either Cart or Order.
 *   For example, tax services accept a CommonOrder and calculate taxes without knowing or
 *   caring whether it is for a Cart or an Order.
 */
export const CommonOrder = new SimpleSchema({
  accountId: {
    type: String,
    optional: true
  },
  billingAddress: {
    type: OrderAddress,
    optional: true
  },
  cartId: {
    type: String,
    optional: true
  },
  currencyCode: String,
  fulfillmentMethodId: {
    type: String,
    optional: true
  },
  fulfillmentPrices: CommonOrderFulfillmentPrices,
  fulfillmentType: {
    type: String,
    allowedValues: ["shipping"]
  },
  items: [CommonOrderItem],
  orderId: {
    type: String,
    optional: true
  },
  originAddress: {
    type: OrderAddress,
    optional: true
  },
  shippingAddress: {
    type: OrderAddress,
    optional: true
  },
  shopId: String,
  sourceType: {
    type: String,
    allowedValues: ["cart", "order"]
  },
  totals: {
    type: CommonOrderTotals,
    optional: true
  }
});

export const orderItemInputSchema = new SimpleSchema({
  "addedAt": {
    type: Date,
    optional: true
  },
  "price": Number,
  "productConfiguration": Object,
  "productConfiguration.productId": String,
  "productConfiguration.productVariantId": String,
  "quantity": {
    type: SimpleSchema.Integer,
    min: 1
  }
});

export const orderFulfillmentGroupInputSchema = new SimpleSchema({
  "data": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "items": {
    type: Array,
    minCount: 1
  },
  "items.$": orderItemInputSchema,
  "selectedFulfillmentMethodId": String,
  "shopId": String,
  "totalPrice": {
    type: Number,
    optional: true
  },
  "type": {
    type: String,
    allowedValues: ["shipping"]
  }
});

// Exported for unit tests
export const orderInputSchema = new SimpleSchema({
  // Although billing address is typically needed only by the payment plugin,
  // some tax services require it to calculate taxes for digital items. Thus
  // it should be provided here in order to be added to the CommonOrder if possible.
  "billingAddress": {
    type: OrderAddress,
    optional: true
  },
  "cartId": {
    type: String,
    optional: true
  },
  "currencyCode": String,
  /**
   * If you need to store customFields, be sure to add them to your
   * GraphQL input schema and your Order SimpleSchema with proper typing.
   * This schema need not care what `customFields` is because the input
   * and Order schemas will validate. Thus, we use blackbox here.
   */
  "customFields": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "email": String,
  "fulfillmentGroups": {
    type: Array,
    minCount: 1
  },
  "fulfillmentGroups.$": orderFulfillmentGroupInputSchema,
  "ordererPreferredLanguage": {
    type: String,
    optional: true
  },
  "shopId": String
});

export const paymentInputSchema = new SimpleSchema({
  amount: Number,
  // Optionally override the order.billingAddress for each payment
  billingAddress: {
    type: OrderAddress,
    optional: true
  },
  data: {
    type: Object,
    optional: true,
    blackbox: true
  },
  method: String
});

/**
 * @name AnonymousAccessToken
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {Date} createdAt when token was created
 * @property {String} hashedToken token hash = base64(sha256(token-random-string))
 */
const AnonymousAccessToken = new SimpleSchema({
  createdAt: Date,
  hashedToken: String
});

/**
 * @name Document
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} docId required
 * @property {String} docType optional
 */
const Document = new SimpleSchema({
  docId: {
    type: String
  },
  docType: {
    type: String,
    optional: true
  }
});

/**
 * @name ExportHistory
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} status (required) Whether the export attempt succeeded or failed
 * @property {Date} dateAttempted (required) Date the export was attempted
 * @property {String} exportMethod (required) Name of the export method (e.g. CSV, Shopify)
 * @property {String} destinationIdentifier The identifier for this order on the remote system
 * @property {String} shopId (required) The shop ID
 */
const ExportHistory = new SimpleSchema({
  status: {
    type: String,
    allowedValues: ["success", "failure"]
  },
  dateAttempted: {
    type: Date
  },
  exportMethod: {
    type: String
  },
  destinationIdentifier: {
    type: String,
    optional: true
  },
  shopId: {
    type: String
  }
});

/**
 * @name History
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} event required
 * @property {String} value required
 * @property {String} userId required
 * @property {String} updatedAt required
 */
const History = new SimpleSchema({
  event: {
    type: String
  },
  value: {
    type: String
  },
  userId: {
    type: String
  },
  updatedAt: {
    type: Date
  }
});

/**
 * @name OrderInvoice
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {Number} discounts Total of all discounts (a positive number, but subtracted from the grand total)
 * @property {Number} effectiveTaxRate The effective tax rate, for display
 * @property {Number} shipping Price of the selected fulfillment method
 * @property {Number} subtotal Item total
 * @property {Number} surcharges Total of all surcharges
 * @property {Number} taxableAmount Total amount that was deemed taxable by the tax service
 * @property {Number} taxes Total tax
 * @property {Number} total Grand total
 */
export const OrderInvoice = new SimpleSchema({
  currencyCode: String,
  discounts: {
    type: Number,
    min: 0
  },
  effectiveTaxRate: {
    type: Number,
    min: 0
  },
  shipping: {
    type: Number,
    min: 0
  },
  subtotal: {
    type: Number,
    min: 0
  },
  surcharges: {
    type: Number,
    min: 0
  },
  taxes: {
    type: Number,
    min: 0
  },
  taxableAmount: {
    type: Number,
    min: 0
  },
  total: {
    type: Number,
    min: 0
  }
});

/**
 * @name Notes
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} content required
 * @property {String} userId required
 * @property {Date} updatedAt required
 */
const Notes = new SimpleSchema({
  content: {
    type: String
  },
  userId: {
    type: String
  },
  updatedAt: {
    type: Date
  }
});

/**
 * @name Workflow
 * @summary Control view flow by attaching layout to a collection.
 * Shop defaultWorkflow is defined in Shop.
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} status, default value: `new`
 * @property {String[]} workflow optional
 */
const Workflow = new SimpleSchema({
  "status": {
    type: String,
    defaultValue: "new"
  },
  "workflow": {
    type: Array,
    optional: true
  },
  "workflow.$": String
});

/**
 * @name OrderDiscount
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {Number} amount Amount of discount applied to the order
 * @property {String} discountId Discount ID
 */
const OrderDiscount = new SimpleSchema({
  amount: Number,
  discountId: String
});

/**
 * @name OrderItemAttribute
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} label required
 * @property {String} value optional
 */
const OrderItemAttribute = new SimpleSchema({
  label: String,
  value: {
    type: String,
    optional: true
  }
});

/**
 * @name OrderItem
 * @memberof Schemas
 * @summary Defines one item in an order
 * @type {SimpleSchema}
 * @property {String} _id Unique ID for the item
 * @property {String} addedAt Date/time when this was first added to the cart/order
 * @property {OrderItemAttribute[]} attributes Attributes of this item
 * @property {String} cancelReason Free text reason for cancel, if this item is canceled
 * @property {String} createdAt Date/time when this order item was created
 * @property {Document[]} documents optional
 * @property {History[]} history optional
 * @property {String} optionTitle optionTitle from the selected variant
 * @property {ShippingParcel} parcel Currently, parcel is in simple product schema. Need to include it here as well.
 * @property {Money} price The price+currency of variantId at the moment the related order was placed
 * @property {String} productId required
 * @property {String} productSlug Product slug
 * @property {String} productType Product type
 * @property {String} productVendor Product vendor
 * @property {Number} quantity required
 * @property {String} shopId The owner shop
 * @property {Number} subtotal The item subtotal, quantity x price
 * @property {String} title Title from the selected product
 * @property {String} updatedAt required
 * @property {String} variantId required
 * @property {String} variantTitle Title from the selected variant
 * @property {Workflow} workflow optional
 *
 */
export const OrderItem = new SimpleSchema({
  "_id": String,
  "addedAt": Date,
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": OrderItemAttribute,
  "cancelReason": {
    type: String,
    optional: true
  },
  "createdAt": Date,
  "documents": {
    type: Array,
    optional: true
  },
  "documents.$": {
    type: Document
  },
  "history": {
    type: Array,
    optional: true
  },
  "history.$": {
    type: History
  },
  "optionTitle": {
    type: String,
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "price": Money,
  "productId": String,
  "productSlug": {
    type: String,
    optional: true
  },
  "productType": {
    label: "Product Type",
    type: String,
    optional: true
  },
  "productTagIds": {
    label: "Product Tags",
    type: Array,
    optional: true
  },
  "productTagIds.$": String,
  "productVendor": {
    label: "Product Vendor",
    type: String,
    optional: true
  },
  "quantity": {
    label: "Quantity",
    type: SimpleSchema.Integer,
    min: 0
  },
  "shopId": String,
  "subtotal": Number,
  "title": String,
  "updatedAt": Date,
  "variantId": {
    type: String,
    optional: true
  },
  "variantTitle": {
    type: String,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  }
});

/**
 * @name SelectedFulfillmentOption
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id Shipment method Id
 * @property {String} carrier optional
 * @property {String} currencyCode Currency code for interpreting rate and handling
 * @property {String} group Group, allowed values: `Ground`, `Priority`, `One Day`, `Free`
 * @property {Number} handling optional, default value: `0`
 * @property {String} label Public label
 * @property {String} name Method name
 * @property {Number} rate Rate
 */
const SelectedFulfillmentOption = new SimpleSchema({
  _id: String,
  carrier: {
    type: String,
    optional: true
  },
  currencyCode: String,
  group: {
    type: String,
    optional: true
  },
  handling: {
    type: Number,
    min: 0
  },
  label: String,
  name: String,
  rate: {
    type: Number,
    min: 0
  }
});

/**
 * @name OrderFulfillmentGroup Schema
 * @memberof Schemas
 * @summary One fulfillment group of an order
 * @type {SimpleSchema}
 * @property {String} _id Group ID
 * @property {Object} address Shipping address
 * @property {String} customsLabelUrl URL for customs label
 * @property {Object} invoice Invoice (same as the one on Payment)
 * @property {Object[]} items The order items in this group
 * @property {String[]} itemIds For convenience, the _id of all the items
 * @property {Object} payment The payment info for this group
 * @property {Object} shipmentMethod The fulfillment method that was chosen by the customer
 * @property {String} shippingLabelUrl URL for shipping label
 * @property {String} shopId The shop that fulfills this group
 * @property {Number} totalItemQuantity The total item quantity, sum of all quantities
 * @property {String} tracking Tracking reference ID
 * @property {String} trackingUrl Tracking URL
 * @property {String} type Fulfillment type
 * @property {Object} workflow Current status and past statuses for this fulfillment
 */
export const OrderFulfillmentGroup = new SimpleSchema({
  "_id": String,
  "address": {
    type: OrderAddress,
    optional: true
  },
  "customsLabelUrl": {
    type: String,
    optional: true
  },
  "invoice": OrderInvoice,
  "items": {
    type: Array,
    minCount: 1
  },
  "items.$": OrderItem,
  "itemIds": [String],
  "shipmentMethod": SelectedFulfillmentOption,
  "shippingLabelUrl": {
    type: String,
    optional: true
  },
  "shopId": String,
  "totalItemQuantity": {
    type: SimpleSchema.Integer,
    min: 1
  },
  "tracking": {
    type: String,
    optional: true
  },
  "trackingUrl": {
    type: String,
    optional: true
  },
  "type": {
    type: String,
    allowedValues: ["shipping"]
  },
  "updatedAt": {
    type: Date,
    optional: true
  },
  "workflow": Workflow
});

/**
 * @name OrderTransaction Schema
 * @memberof Schemas
 * @summary Order transactions tie Shipping, Payment, and Inventory transactions
 * @type {SimpleSchema}
 * @property {String} itemId optional
 * @property {String} paymentId optional
 * @property {String} shipmentId optional
 * @property {String} inventoryId optional
 * @property {Date} createdAt required
 */
const OrderTransaction = new SimpleSchema({
  itemId: {
    type: String,
    optional: true
  },
  paymentId: {
    type: String,
    optional: true
  },
  shipmentId: {
    type: String,
    optional: true
  },
  inventoryId: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  }
});


/**
 * @name CurrencyExchangeRate
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} userCurrency, default value: `"USD"`
 * @property {Number} exchangeRate optional
 */
const CurrencyExchangeRate = new SimpleSchema({
  userCurrency: {
    type: String,
    optional: true,
    defaultValue: "USD"
  },
  exchangeRate: {
    type: Number,
    optional: true
  }
});

/**
 * @name Payment
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} _id Payment ID
 * @property {Address} [address] Billing address
 * @property {Number} amount The amount paid or authorized
 * @property {String} [cardBrand] The brand of card, if the payment method was a credit card
 * @property {CurrencyExchangeRate} [currency] The exchange rate, if the user's currency is different from shop's
 * @property {Object} [data] Arbitrary data that the payment method needs
 * @property {String} mode "authorize" if still needs to be captured, or "capture" if captured. "cancel" if auth was canceled.
 * @property {Invoice} invoice A summary of the totals that make up the full charge amount. Created when the payment is added to an order.
 * @property {String} shopId The ID of the shop that is being paid. This might be a merchant shop in a marketplace setup.
 */
export const Payment = new SimpleSchema({
  "_id": {
    type: String,
    label: "Payment Id"
  },
  "address": {
    type: OrderAddress,
    optional: true
  },
  "amount": Number,
  "captureErrorCode": {
    type: String,
    optional: true
  },
  "captureErrorMessage": {
    type: String,
    optional: true
  },
  "cardBrand": {
    type: String,
    optional: true
  },
  "createdAt": Date,
  "currency": {
    type: CurrencyExchangeRate,
    optional: true
  },
  "currencyCode": String,
  "data": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "displayName": String,
  "method": String,
  "mode": String,
  "name": String,
  "paymentPluginName": String,
  "processor": String,
  "riskLevel": {
    type: String,
    optional: true
  },
  "shopId": String,
  "status": String,
  "transactionId": String,
  "transactions": {
    type: Array
  },
  "transactions.$": {
    type: Object,
    blackbox: true
  }
});

/**
 * @name Order Schema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Order has an array of History, Documents, Notes, Items and OrderTransactions.
 * @property {String} _id required
 * @property {String} accountId Account ID for account orders, or null for anonymous
 * @property {Object[]} anonymousAccessTokens Tokens for accessing anonymous orders, null for account orders
 * @property {String} anonymousAccessTokens.hashedToken The hashed value for DB queries
 * @property {Date} anonymousAccessTokens.createdAt When the token was created. Expiry is not currently implemented, but this Date is here to support that.
 * @property {Address} [billingAddress] Optional billing address
 * @property {String} cartId optional For tracking which cart created this order
 * @property {Date} createdAt required
 * @property {String} currencyCode required
 * @property {Object} customFields optional
 * @property {Document[]} documents optional
 * @property {String} email optional
 * @property {Object[]} exportHistory optional
 * @property {History[]} history optional
 * @property {Notes[]} notes optional
 * @property {Payment[]} payments Array of payments
 * @property {Shipment[]} shipping Array of fulfillment groups
 * @property {String} shopId required The owner shop
 * @property {Surcharges[]} surcharges Surcharges applied to this order
 * @property {OrderTransaction[]} transactions optional
 * @property {Date} updatedAt optional
 * @property {Workflow} workflow optional
 */
export const Order = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "accountId": {
    type: String,
    optional: true
  },
  "anonymousAccessTokens": {
    type: Array,
    optional: true
  },
  "anonymousAccessTokens.$": AnonymousAccessToken,
  // Although billing address is typically needed only by the payment plugin,
  // some tax services require it to calculate taxes for digital items. Thus
  // it should be provided here in order to be added to the CommonOrder if possible.
  "billingAddress": {
    type: OrderAddress,
    optional: true
  },
  "cartId": {
    type: String,
    optional: true
  },
  "createdAt": Date,
  "currencyCode": String,
  "customFields": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "discounts": {
    type: Array,
    optional: true
  },
  "discounts.$": OrderDiscount,
  "documents": {
    type: Array,
    optional: true
  },
  "documents.$": Document,
  "email": {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email
  },
  "exportHistory": {
    type: Array,
    optional: true
  },
  "exportHistory.$": ExportHistory,
  "history": {
    type: Array,
    optional: true
  },
  "history.$": History,
  "notes": {
    type: Array,
    optional: true
  },
  "notes.$": Notes,
  "ordererPreferredLanguage": {
    type: String,
    optional: true
  },
  "payments": {
    type: Array,
    optional: true
  },
  "payments.$": Payment,
  "referenceId": {
    type: String
  },
  "shipping": [OrderFulfillmentGroup],
  "shopId": String,
  "surcharges": {
    type: Array,
    optional: true
  },
  "surcharges.$": {
    type: AppliedSurcharge
  },
  "totalItemQuantity": {
    type: SimpleSchema.Integer,
    min: 1
  },
  "transactions": {
    type: Array,
    optional: true
  },
  "transactions.$": OrderTransaction,
  "updatedAt": {
    type: Date,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  }
});

/**
 * @summary Extend schemas from other plugins
 * @param {Object} schemas Schema map from context
 * @return {undefined}
 */
export function extendOrdersSchemas(schemas) {
  schemas.Shop.extend({
    orderStatusLabels: {
      type: Object,
      blackbox: true,
      optional: true
    }
  });
}
