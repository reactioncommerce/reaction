/**
 * VariantMedia Schema
 */
ReactionCore.Schemas.VariantMedia = new SimpleSchema({
  mediaId: {
    type: String,
    optional: true
  },
  priority: {
    type: Number,
    optional: true
  },
  metafields: {
    type: [ReactionCore.Schemas.Metafield],
    optional: true
  },
  updatedAt: {
    type: Date,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    denyUpdate: true
  }
});

/**
 * Schema "Price range" for a product
 * @summary needed for denormalizing of price range
 * @type {SimpleSchema}
 * @todo I'm not sure what is the best way: to keep it as string "5 - 10", or
 * as two numbers in object. The second could be faster for cases with discount,
 * or not too much? If we decide to keep priceRange as string, then this SS
 * could be removed.
 */
ReactionCore.Schemas.PriceRange = new SimpleSchema({
  min: {
    label: "Minimum product price",
    type: Number,
    decimal: true,
    defaultValue: 0
  },
  max: {
    label: "Maximum product price",
    type: Number,
    decimal: true,
    defaultValue: 0
  }
});

/**
 * ProductPosition Schema
 */
ReactionCore.Schemas.ProductPosition = new SimpleSchema({
  tag: {
    type: String,
    optional: true
  },
  position: {
    type: Number,
    optional: true
  },
  pinned: {
    type: Boolean,
    optional: true
  },
  weight: {
    type: Number,
    optional: true,
    defaultValue: 0,
    min: 0,
    max: 3
  },
  updatedAt: {
    type: Date
  }
});

/**
 * ProductVariant Schema
 */

ReactionCore.Schemas.ProductVariant = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    // autoValue: ReactionCore.schemaIdAutoValue,
    index: 1,
    label: "Variant ID"
  },
  ancestors: {
    type: [String],
    defaultValue: []
  },
  //parentId: {
  //  type: String,
  //  optional: true
  //},
  //cloneId: {
  //  type: String,
  //  optional: true
  //},
  index: {
    type: String,
    optional: true
  },
  barcode: {
    label: "Barcode",
    type: String,
    optional: true,
    custom: function () {
      if (Meteor.isClient) {
        if (this.siblingField("type").value === "inventory" && !this.value) {
          return "required";
        }
      }
    }
  },
  compareAtPrice: {
    label: "MSRP",
    type: Number,
    optional: true,
    decimal: true,
    min: 0
  },
  fulfillmentService: {
    label: "Fulfillment service",
    type: String,
    optional: true
  },
  weight: {
    label: "Weight",
    type: Number,
    min: 0,
    optional: true,
    custom: function () {
      if (Meteor.isClient) {
        if (!(this.siblingField("type").value === "inventory" || this.value ||
          this.value === 0)) {
          return "required";
        }
      }
    }
  },
  inventoryManagement: {
    type: Boolean,
    label: "Inventory Tracking",
    optional: true,
    defaultValue: true,
    custom: function () {
      if (Meteor.isClient) {
        if (!(this.siblingField("type").value === "inventory" || this.value ||
          this.value === false)) {
          return "required";
        }
      }
    }
  },
  inventoryPolicy: {
    type: Boolean,
    label: "Deny when out of stock",
    optional: true,
    defaultValue: true,
    custom: function () {
      if (Meteor.isClient) {
        if (!(this.siblingField("type").value === "inventory" || this.value ||
          this.value === false)) {
          return "required";
        }
      }
    }
  },
  lowInventoryWarningThreshold: {
    type: Number,
    label: "Warn @",
    min: 0,
    optional: true
  },
  inventoryQuantity: {
    type: Number,
    label: "Quantity",
    optional: true,
    custom: function () {
      if (Meteor.isClient) {
        if (this.siblingField("type").value !== "inventory") {
          if (checkChildVariants(this.docId) === 0 && !this.value) {
            return "required";
          }
        }
      }
    }
  },
  price: {
    label: "Price",
    type: Number,
    decimal: true,
    min: 0,
    optional: true,
    defaultValue: 0,
    custom: function () {
      if (Meteor.isClient) {
        if (this.siblingField("type").value !== "inventory") {
          if (checkChildVariants(this.docId) === 0 && !this.value) {
            return "required";
          }
        }
      }
    }
  },
  shopId: {
    type: String,
    autoValue: ReactionCore.shopIdAutoValue,
    index: 1,
    label: "Variant ShopId"
  },
  sku: {
    label: "SKU",
    type: String,
    optional: true
  },
  type: {
    label: "Type",
    type: String,
    defaultValue: "variant"
  },
  taxable: {
    label: "Taxable",
    type: Boolean,
    optional: true
  },
  title: {
    label: "Label",
    type: String,
    optional: true,
    custom: function () {
      if (Meteor.isClient) {
        if (!(this.siblingField("type").value === "inventory" || this.value)) {
          return "required";
        }
      }
    }
  },
  optionTitle: {
    label: "Option",
    type: String,
    optional: true
  },
  metafields: {
    type: [ReactionCore.Schemas.Metafield],
    optional: true
  },
  createdAt: {
    label: "Created at",
    type: Date,
    optional: true
  },
  updatedAt: {
    label: "Updated at",
    type: Date,
    optional: true
  }
});

/**
 * Product Schema
 */

ReactionCore.Schemas.Product = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  ancestors: {
    type: [String],
    defaultValue: []
  },
  //cloneId: {
  //  type: String,
  //  optional: true
  //},
  shopId: {
    type: String,
    autoValue: ReactionCore.shopIdAutoValue,
    index: 1,
    label: "Product ShopId"
  },
  title: {
    type: String,
    defaultValue: ""
  },
  pageTitle: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  },
  type: {
    label: "Type",
    type: String,
    defaultValue: "simple"
  },
  vendor: {
    type: String,
    optional: true
  },
  metafields: {
    type: [ReactionCore.Schemas.Metafield],
    optional: true
  },
  positions: {
    type: [ReactionCore.Schemas.ProductPosition],
    optional: true
  },
  price: {
    label: "Denormalized field: Variants price range for a product",
    // type: ReactionCore.Schemas.PriceRange
    type: String,
    defaultValue: "0",
    max: 100
  },
  inventoryManagement: {
    label: 'Denormalized "inventoryManagement" field',
    type: Boolean,
    defaultValue: true
  },
  inventoryPolicy: {
    label: 'Denormalized "inventoryPolicy" field',
    type: Boolean,
    defaultValue: true
  },
  inventoryQuantity: {
    label: "Denormalized field: Variants common quantity",
    type: Number,
    defaultValue: 0
  },
  // this will be just a boolean. I suppose the goal of this field is to display
  // to admin that this product needs his attention.
  lowInventoryWarningThreshold: {
    label: 'Denormalized "lowInventoryWarningThreshold" field',
    type: Boolean,
    defaultValue: false
  },
  requiresShipping: {
    label: "Require a shipping address",
    type: Boolean,
    defaultValue: true,
    optional: true
  },
  parcel: {
    type: ReactionCore.Schemas.ShippingParcel,
    optional: true
  },
  hashtags: {
    type: [String],
    optional: true,
    index: 1
  },
  twitterMsg: {
    type: String,
    optional: true,
    max: 140
  },
  facebookMsg: {
    type: String,
    optional: true,
    max: 255
  },
  googleplusMsg: {
    type: String,
    optional: true,
    max: 255
  },
  pinterestMsg: {
    type: String,
    optional: true,
    max: 255
  },
  metaDescription: {
    type: String,
    optional: true
  },
  handle: {
    type: String,
    optional: true,
    index: 1,
    autoValue: function () {
      let slug = this.value ||  getSlug(this.siblingField("title").value) || this.siblingField("_id").value || "";
      if (this.isInsert) {
        return slug;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: slug
        };
      }
    }
  },
  isVisible: {
    type: Boolean,
    index: 1,
    defaultValue: false
  },
  templateSuffix: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    },
    optional: true
  },
  publishedAt: {
    type: Date,
    optional: true
  },
  publishedScope: {
    type: String,
    optional: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  }
});
