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
 * @name CartAddress
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
export const CartAddress = new SimpleSchema({
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
 * @name ShippoShippingMethod
 * @memberof Schemas
 * @type {SimpleSchema}
 * @todo Move Shippo-related schema to Shippo module
 * @summary This will only exist in ShippingMethods Inside Cart/Order.
 * This does not exist in DB Shipping Collection as Shippo Methods are Dynamic.
 * @property {String} serviceLevelToken optional
 * @property {String} rateId optional
 */
const ShippoShippingMethod = new SimpleSchema({
  serviceLevelToken: {
    type: String,
    optional: true
  },
  rateId: {
    type: String,
    optional: true
  }
});

/**
 * @name ShippingMethod
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id Shipment method Id
 * @property {String} name Method name
 * @property {String} label Public label
 * @property {String} group Group, allowed values: `Ground`, `Priority`, `One Day`, `Free`
 * @property {Number} cost optional
 * @property {Number} handling optional, default value: `0`
 * @property {Number} rate Rate
 * @property {Boolean} enabled default value: `false`
 * @property {Array} validRanges optional, Matching cart ranges
 * @property {Object} validRanges.$ optional
 * @property {Number} validRanges.begin optional
 * @property {Number} validRanges.end optional
 * @property {Array} validLocales optional
 * @property {Object} validLocales.$ optional
 * @property {String} validLocales.$.origination optional
 * @property {String} validLocales.$.destination optional
 * @property {Number} validLocales.$.deliveryBegin optional
 * @property {Number} validLocales.$.deliveryEnd optional
 * @property {String} carrier optional
 * @property {ShippoShippingMethod} settings optional
 */
const ShippingMethod = new SimpleSchema({
  "_id": {
    type: String,
    label: "Shipment Method Id"
  },
  "name": {
    type: String,
    label: "Method Name",
    optional: true
  },
  "label": {
    type: String,
    label: "Public Label"
  },
  "group": {
    type: String,
    label: "Group",
    allowedValues: ["Ground", "Priority", "One Day", "Free"],
    optional: true
  },
  "cost": {
    type: Number,
    label: "Cost",
    optional: true
  },
  "handling": {
    type: Number,
    label: "Handling",
    optional: true,
    defaultValue: 0,
    min: 0
  },
  "rate": {
    type: Number,
    label: "Rate",
    min: 0
  },
  "enabled": {
    type: Boolean,
    label: "Enabled",
    defaultValue: false
  },
  "validRanges": {
    type: Array,
    optional: true,
    label: "Matching Cart Ranges"
  },
  "validRanges.$": {
    type: Object,
    optional: true
  },
  "validRanges.$.begin": {
    type: Number,
    label: "Begin",
    optional: true
  },
  "validRanges.$.end": {
    type: Number,
    label: "End",
    optional: true
  },
  "validLocales": {
    type: Array,
    optional: true,
    label: "Matching Locales"
  },
  "validLocales.$": {
    type: Object,
    optional: true
  },
  "validLocales.$.origination": {
    type: String,
    label: "From",
    optional: true
  },
  "validLocales.$.destination": {
    type: String,
    label: "To",
    optional: true
  },
  "validLocales.$.deliveryBegin": {
    type: SimpleSchema.Integer,
    label: "Shipping Est.",
    optional: true
  },
  "validLocales.$.deliveryEnd": {
    type: SimpleSchema.Integer,
    label: "Delivery Est.",
    optional: true
  },
  "carrier": { // kind of denormalizing, useful for having it in shipmentMethod( cart & order)
    type: String, // Alternatively we can make an extra Schema:ShipmentMethod, that inherits
    optional: true // ShippingMethod and add the optional carrier field
  },
  "settings": {
    type: ShippoShippingMethod,
    optional: true
  },
  "fulfillmentTypes": {
    type: Array
  },
  "fulfillmentTypes.$": String
});

/**
 * @name ShipmentQuote
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} carrier Name of carrier
 * @property {ShippingMethod} method ShippingMethod
 * @property {Number} rate default value: `0.00`
 */
export const ShipmentQuote = new SimpleSchema({
  carrier: {
    type: String
  },
  handlingPrice: {
    type: Number,
    optional: true
  },
  method: {
    type: ShippingMethod
  },
  rate: {
    type: Number,
    defaultValue: 0.00
  },
  shippingPrice: {
    type: Number,
    optional: true
  },
  shopId: {
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

/**
 * @name ShippoShipment
 * @summary Specific properties of Shipment for use with Shippo. We don't use
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} transactionId optional
 * @property {String} trackingStatusStatus optional Tracking Status's status
 * @property {String} trackingStatusDate optional
 */
const ShippoShipment = new SimpleSchema({
  transactionId: {
    type: String,
    optional: true
  },
  trackingStatusStatus: { // cause tracking_status.status
    type: String,
    optional: true
  },
  trackingStatusDate: {
    type: String,
    optional: true
  }
});

/**
 * @name ShipmentQuotesQueryStatusUsed
 * @todo Should requestStatus be required or not?
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Status of a query/consumption of a shipping provider's API (e.g Shippo) for shipping quotations.
 * @description Shipping quotations are the costs from different shipping methods like FedEx, DHL etc of
 * shipping one or more items to a particular place in a given amount of time.)
 * @property {String} requestStatus optional, default value: `noRequestsYet`
 * @property {String} shippingProvider optional
 * @property {Number} numOfShippingMethodsFound optional
 * @property {String} message optional
 */
const ShipmentQuotesQueryStatus = new SimpleSchema({
  requestStatus: {
    type: String,
    optional: true,
    defaultValue: "noRequestsYet"
  },
  shippingProvider: {
    type: String,
    optional: true
  },
  numOfShippingMethodsFound: {
    type: SimpleSchema.Integer,
    optional: true
  },
  message: {
    type: String,
    optional: true
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
 * @name CartInvoice
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
export const CartInvoice = new SimpleSchema({
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
 * @name Shipment
 * @summary Used for cart/order shipment tracking
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id Shipment ID
 * @property {String} shopId required
 * @property {String} paymentId Payment ID
 * @property {Address} address optional
 * @property {ShippingMethod} shipmentMethod optional
 * @property {ShipmentQuote[]} shipmentQuotes optional
 * @property {ShipmentQuotesQueryStatus} shipmentQuotesQueryStatus optional
 * @property {String} tracking optional
 * @property {String} type The fulfillment type. Currently only "shipping" supported
 * @property {ShippingParcel} parcel optional
 * @property {Workflow} workflow optional
 * @property {Invoice} invoice optional
 * @property {String[]} itemIds Required on an order but not on a cart, this is set to a denormalized
 *   list of item IDs when a cart is converted to an order
 * @property {Object[]} transactions optional
 * @property {String} shippingLabelUrl For printable Shipping label
 * @property {String} customsLabelUrl For customs printable label
 * @property {ShippoShipment} shippo For Shippo specific properties
 */
const Shipment = new SimpleSchema({
  "_id": {
    type: String,
    label: "Shipment Id"
  },
  "shopId": {
    type: String
  },
  "paymentId": {
    type: String,
    label: "Payment Id",
    optional: true
  },
  "address": {
    type: CartAddress,
    optional: true
  },
  "shipmentMethod": {
    type: ShippingMethod,
    optional: true
  },
  "shipmentQuotes": {
    type: Array,
    optional: true
  },
  "shipmentQuotes.$": {
    type: ShipmentQuote,
    optional: true
  },
  "shipmentQuotesQueryStatus": {
    type: ShipmentQuotesQueryStatus,
    optional: true,
    defaultValue: {}
  },
  "tracking": {
    type: String,
    optional: true
  },
  "type": {
    type: String,
    allowedValues: ["shipping"],
    defaultValue: "shipping"
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  },
  "invoice": {
    type: CartInvoice,
    optional: true
  },
  "itemIds": {
    type: Array,
    optional: true
  },
  "itemIds.$": String,
  "transactions": {
    type: Array,
    optional: true
  },
  "transactions.$": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "shippingLabelUrl": {
    type: String,
    optional: true
  },
  "customsLabelUrl": {
    type: String,
    optional: true
  },
  "shippo": {
    type: ShippoShipment,
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
 * @name CartItemAttribute
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} label required
 * @property {String} value optional
 */
const CartItemAttribute = new SimpleSchema({
  label: String,
  value: {
    type: String,
    optional: true
  }
});

/**
 * @name CartItem
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {String} addedAt required
 * @property {CartItemAttribute[]} attributes Attributes of this item
 * @property {String} createdAt required
 * @property {Metafield[]} metafields
 * @property {String} optionTitle optionTitle from the selected variant
 * @property {ShippingParcel} parcel Currently, parcel is in simple product schema. Need to include it here as well.
 * @property {Money} price The current price of this item
 * @property {Money} priceWhenAdded The price+currency at the moment this item was added to this cart
 * @property {String} productId required
 * @property {String} productSlug Product slug
 * @property {String} productType Product type
 * @property {String} productVendor Product vendor
 * @property {Number} quantity required
 * @property {String} shopId Cart Item shopId
 * @property {String} title Cart Item title
 * @property {Object} transaction Transaction associated with this item
 * @property {String} updatedAt required
 * @property {String} variantId required
 * @property {String} variantTitle Title from the selected variant
 */
export const CartItem = new SimpleSchema({
  "_id": String,
  "addedAt": Date,
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": CartItemAttribute,
  "compareAtPrice": {
    type: Money,
    optional: true
  },
  "createdAt": Date,
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": Metafield,
  "optionTitle": {
    type: String,
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "price": Money,
  "priceWhenAdded": Money,
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
  "shopId": {
    type: String,
    label: "Cart Item shopId"
  },
  "subtotal": Money,
  "title": {
    type: String,
    label: "CartItem Title"
  },
  "transaction": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "updatedAt": Date,
  "variantId": {
    type: String,
    optional: true
  },
  "variantTitle": {
    type: String,
    optional: true
  }
});

/**
 * @name Cart
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required for check of users' carts
 * @property {String} shopId required, Cart ShopId
 * @property {String} accountId Account ID for account carts, or null for anonymous
 * @property {String} anonymousAccessToken Token for accessing anonymous carts, null for account carts
 * @property {String} email optional
 * @property {CartItem[]} items Array of CartItem optional
 * @property {Shipment[]} shipping Array of Shipment optional, blackbox
 * @property {Payment[]} billing Array of Payment optional, blackbox
 * @property {String} sessionId Optional and deprecated
 * @property {Number} discount optional
 * @property {Surcharges[]} surcharges optional
 * @property {Workflow} workflow optional
 * @property {Date} createdAt required
 * @property {Date} updatedAt optional
 */
export const Cart = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String,
    label: "Cart ShopId"
  },
  "accountId": {
    type: String,
    optional: true
  },
  "anonymousAccessToken": {
    type: String,
    optional: true
  },
  "currencyCode": String,
  "billingAddress": {
    type: CartAddress,
    optional: true
  },
  "sessionId": {
    type: String,
    optional: true
  },
  "referenceId": {
    type: String,
    optional: true
  },
  "email": {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email
  },
  "items": {
    type: Array,
    optional: true
  },
  "items.$": {
    type: CartItem
  },
  "shipping": {
    type: Array,
    optional: true
  },
  "shipping.$": {
    type: Shipment
  },
  /* Working to get rid of cart.billing, but currently still where discounts are applied to carts */
  "billing": {
    type: Array,
    optional: true
  },
  "billing.$": {
    type: Object,
    blackbox: true
  },
  "bypassAddressValidation": {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  "discount": {
    type: Number,
    optional: true
  },
  "surcharges": {
    type: Array,
    optional: true
  },
  "surcharges.$": {
    type: AppliedSurcharge
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  },
  "createdAt": {
    type: Date
  },
  "updatedAt": {
    type: Date,
    optional: true
  }
});
