
ReactionCore.Schemas.AdvancedFulfillmentPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
    'settings.buffer.shipping': {
      type: Number,
      defaultValue: 3,
      label: 'Number of days to customer receiving date that orders need to fulfilled.',
      optional: true
    },
    'settings.buffer.returning': {
      type: Number,
      defaultValue: 4,
      label: 'Number of days past the customer use date, until orders should be returned.',
      optional: true
    }
  }
]);

ReactionCore.Schemas.AdvancedFulfillmentDamageQtyAndSubtotal = new SimpleSchema({
  qty: {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  subtotal: {
    type: Number,
    optional: true,
    defaultValue: 0
  }
});

ReactionCore.Schemas.AdvancedFulfillmentRushShippingPaid = new SimpleSchema({
  qty: {
    type: Number,
    optional: true
  },
  subtotal: {
    type: Number,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentDamageCoverage = new SimpleSchema({
  packages: {
    type: ReactionCore.Schemas.AdvancedFulfillmentDamageQtyAndSubtotal,
    optional: true
  },
  products: {
    type: ReactionCore.Schemas.AdvancedFulfillmentDamageQtyAndSubtotal,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentAfterShipShippingHistory = new SimpleSchema({
  city: {
    type: String,
    optional: true
  },
  state: {
    type: String,
    optional: true
  },
  message: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    optional: true
  },
  checkPointTime: {
    type: Date,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentAfterShip = new SimpleSchema({
  currentStatus: {
    type: String,
    optional: true
  },
  currentMessage: {
    type: String,
    optional: true
  },
  trackingNumber: {
    type: String,
    optional: true
  },
  currentCity: {
    type: String,
    optional: true
  },
  currentState: {
    type: String,
    optional: true
  },
  history: {
    type: [ReactionCore.Schemas.AdvancedFulfillmentAfterShipShippingHistory],
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentSkiPackage = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  customerName: {
    type: String,
    optional: true
  },
  packageName: {
    type: String,
    optional: true
  },
  vendor: {
    type: String,
    optional: true
  },
  height: {
    type: String,
    optional: true
  },
  weight: {
    type: String,
    optional: true
  },
  gender: {
    type: String,
    optional: true
  },
  helmet: {
    type: Boolean,
    optional: true
  },
  age: {
    type: Number,
    optional: true
  },
  shoeSize: {
    type: String,
    optional: true
  },
  deliveryDateAndTime: {
    type: Date,
    optional: true
  },
  skiLevel: {
    type: String,
    optional: true
  },
  qty: {
    type: Number,
    optional: true
  },
  price: {
    type: Number,
    optional: true,
    decimal: true
  },
  rentalLength: {
    type: Number,
    optional: true
  },
  variantTitle: {
    type: String,
    optional: true
  },
  confirmedWithMerchant: {
    type: Boolean,
    optional: true
  },
  contactedCustomer: {
    type: Boolean,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentKayakRental = new SimpleSchema({
  vendor: {
    type: String,
    optional: true
  },
  qty: {
    type: Number,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentCancelInfo = new SimpleSchema({
  canceledAt: {
    type: Date,
    optional: true
  },
  reason: {
    type: String,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentPaymentInfo = new SimpleSchema({
  totalPrice: {
    type: Number,
    optional: true,
    decimal: true
  },
  totalTax: {
    type: Number,
    optional: true,
    decimal: true
  },
  subtotalPrice: {
    type: Number,
    optional: true,
    decimal: true
  },
  totalItemsPrice: {
    type: Number,
    optional: true,
    decimal: true
  },
  totalDiscount: {
    type: Number,
    optional: true,
    decimal: true
  },
  discountCodes: {
    type: [Object],
    optional: true,
    blackbox: true
  },
  refunds: {
    type: [Object],
    optional: true,
    blackbox: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentNonWinterItems = new SimpleSchema({
  vendor: {
    type: String,
    optional: true
  },
  qty: {
    type: Number,
    optional: true
  },
  product: {
    type: String,
    optional: true
  },
  price: {
    type: Number,
    optional: true,
    decimal: true
  },
  variantTitle: {
    type: String,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentItem = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  productId: {
    type: String,
    index: 1,
    label: 'THE PRODUCT IN AF',
    optional: true
  },
  shopId: {
    type: String,
    index: 1,
    optional: true
  },
  quantity: {
    type: Number,
    min: 0,
    optional: true
  },
  variantId: {
    type: String,
    optional: true
  },
  itemDescription: {
    type: String,
    optional: true
  },
  color: {
    type: String,
    optional: true
  },
  size: {
    type: String,
    optional: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  },
  price: {
    type: Number,
    optional: true,
    decimal: true,
    min: 0
  },
  sku: {
    type: String,
    optional: true
  },
  location: {
    type: String,
    optional: true
  },
  bundleName: {
    type: String,
    optional: true
  },
  customerName: {
    type: String,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillmentObject = new SimpleSchema({
  shipmentDate: {
    type: Date,
    optional: true
  },
  returnDate: {
    type: Date,
    optional: true
  },
  outboundTrackingNumbers: {
    type: [String],
    optional: true
  },
  outboundTrackingUrls: {
    type: [String],
    optional: true
  },
  inboundTrackingNumbers: {
    type: [String],
    optional: true
  },
  inboundTrackingUrls: {
    type: [String],
    optional: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  },
  items: {
    type: [ReactionCore.Schemas.AdvancedFulfillmentItem],
    optional: true
  },
  arriveBy: {
    type: Date,
    optional: true
  },
  shipReturnBy: {
    type: Date,
    optional: true
  },
  transitTime: {
    type: Number,
    optional: true
  },
  localDelivery: {
    type: Boolean,
    optional: true
  },
  rushDelivery: {
    type: Boolean,
    optional: true
  },
  impossibleShipDate: {
    type: Boolean,
    optional: true
  },
  damageCoverage: {
    type: ReactionCore.Schemas.AdvancedFulfillmentDamageCoverage,
    optional: true
  },
  skiPackages: {
    type: [ReactionCore.Schemas.AdvancedFulfillmentSkiPackage],
    optional: true
  },
  skiPackagesPurchased: {
    type: Boolean,
    optional: true
  },
  kayakRental: {
    type: ReactionCore.Schemas.AdvancedFulfillmentKayakRental,
    optional: true
  },
  rushShippingPaid: {
    type: ReactionCore.Schemas.AdvancedFulfillmentRushShippingPaid,
    optional: true
  },
  other: {
    type: [ReactionCore.Schemas.AdvancedFulfillmentNonWinterItems],
    optional: true
  },
  shippingHistory: {
    type: ReactionCore.Schemas.AdvancedFulfillmentAfterShip,
    optional: true
  },
  paymentInformation: {
    type: ReactionCore.Schemas.AdvancedFulfillmentPaymentInfo,
    optional: true
  },
  canceledInformation: {
    type: ReactionCore.Schemas.AdvancedFulfillmentCancelInfo,
    optional: true
  },
  'delivered': {
    type: Boolean,
    optional: true
  }
});

ReactionCore.Schemas.AdvancedFulfillment = new SimpleSchema([ReactionCore.Schemas.Orders, {
  advancedFulfillment: {
    type: ReactionCore.Schemas.AdvancedFulfillmentObject,
    optional: true
  },
  orderNotes: {
    type: String,
    optional: true
  }
}]);

ReactionCore.Collections.Orders.attachSchema(ReactionCore.Schemas.AdvancedFulfillment);
