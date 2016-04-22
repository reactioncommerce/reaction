ReactionCore.Schemas.Inventory = new SimpleSchema({
  _id: {
    type: String,
    optional: true // inserted by mongo, we need it for schema validation
  },
  shopId: {
    type: String,
    autoValue: ReactionCore.shopIdAutoValue,
    index: 1,
    label: "Inventory ShopId"
  },
  productId: {
    type: String,
    index: true
  },
  variantId: {
    type: String,
    index: true
  },
  orderItemId: {
    type: String,
    index: true,
    optional: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  },
  sku: {
    label: "sku",
    type: String,
    optional: true
  },
  metafields: {
    type: [ReactionCore.Schemas.Metafield],
    optional: true
  },
  documents: {
    type: [ReactionCore.Schemas.Document],
    optional: true
  },
  notes: {
    type: [ReactionCore.Schemas.Notes],
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true, // schema validation failing in method with this required. should be considered temporary.
    autoValue: function () {
      if (this.isInsert || this.isUpdate && !this.isSet) {
        return new Date;
      }
      this.unset();
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    },
    optional: true
  }
});
