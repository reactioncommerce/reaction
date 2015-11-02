ReactionCore.Schemas.Inventory = new SimpleSchema({
  shopId: {
    type: String,
    autoValue: ReactionCore.shopIdAutoValue,
    index: 1,
    label: "Inventory Product ShopId"
  },
  productId: {
    type: String,
    index: true
  },
  variantId: {
    type: String,
    optional: true,
    index: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  },
  barcode: {
    label: "Barcode",
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
    autoValue: function () {
      if (this.isInsert || this.isUpdate && !this.isSet) {
        return new Date;
      }
      this.unset();
    },
    denyUpdate: true
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    },
    optional: true
  }
});
