import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ReactionProduct, getSlug } from "/lib/api";
import { shopIdAutoValue } from "./helpers";
import { Metafield } from "./metafield";
import { ShippingParcel } from "./shipping";
import { Workflow } from "./workflow";


/**
 * VariantMedia Schema
 */
export const VariantMedia = new SimpleSchema({
  mediaId: {
    type: String,
    optional: true
  },
  priority: {
    type: Number,
    optional: true
  },
  metafields: {
    type: [Metafield],
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
 * ProductPosition Schema
 */
export const ProductPosition = new SimpleSchema({
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
export const ProductVariant = new SimpleSchema({
  _id: {
    type: String,
    label: "Variant ID"
  },
  ancestors: {
    type: [String],
    defaultValue: []
  },
  // since implementing of flattened model this property is used for keeping
  // array index. This is needed for moving variants through list (drag'n'drop)
  index: {
    label: "Variant position number in list",
    type: Number,
    optional: true
  },
  isVisible: {
    type: Boolean,
    index: 1,
    defaultValue: false
  },
  isDeleted: {
    type: Boolean,
    index: 1,
    defaultValue: false
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
  length: {
    label: "Length",
    type: Number,
    min: 0,
    optional: true
  },
  width: {
    label: "Width",
    type: Number,
    min: 0,
    optional: true
  },
  height: {
    label: "Height",
    type: Number,
    min: 0,
    optional: true
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
  // this represents an ability to sell item without keeping it on stock. In
  // other words if it is disabled, then you can sell item even if it is not in
  // stock.
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
    defaultValue: 0,
    custom: function () {
      if (Meteor.isClient) {
        if (this.siblingField("type").value !== "inventory") {
          if (ReactionProduct.checkChildVariants(this.docId) === 0 && !this.value) {
            return "required";
          }
        }
      }
    }
  },
  minOrderQuantity: {
    label: "Minimum order quantity",
    type: Number,
    optional: true
  },
  // Denormalized field: Indicates when at least one of variants
  // `inventoryQuantity` are lower then their `lowInventoryWarningThreshold`.
  // This is some kind of marketing course.
  isLowQuantity: {
    label: "Indicates that the product quantity is too low",
    type: Boolean,
    optional: true
  },
  // Denormalized field: Indicates when all variants `inventoryQuantity` is zero
  isSoldOut: {
    label: "Indicates when the product quantity is zero",
    type: Boolean,
    optional: true
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
          if (ReactionProduct.checkChildVariants(this.docId) === 0 && !this.value) {
            return "required";
          }
        }
      }
    }
  },
  shopId: {
    type: String,
    autoValue: shopIdAutoValue,
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
    defaultValue: true,
    optional: true
  },
  taxCode: {
    label: "Tax Code",
    type: String,
    defaultValue: "0000",
    optional: true
  },
  taxDescription: {
    type: String,
    optional: true,
    label: "Tax Description"
  },
  // Label for customers
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
  // Option internal name
  optionTitle: {
    label: "Option",
    type: String,
    optional: true,
    defaultValue: "Untitled Option"
  },
  metafields: {
    type: [Metafield],
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
  },
  workflow: {
    type: Workflow,
    optional: true
  },
  originCountry: {
    type: String,
    optional: true
  }
});

export const PriceRange = new SimpleSchema({
  range: {
    type: String,
    defaultValue: "0.00"
  },
  min: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    optional: true
  },
  max: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    optional: true
  }
});

/**
 * Product Schema
 */
export const Product = new SimpleSchema({
  _id: {
    type: String,
    label: "Product Id"
  },
  ancestors: {
    type: [String],
    defaultValue: []
  },
  shopId: {
    type: String,
    autoValue: shopIdAutoValue,
    index: 1,
    label: "Product ShopId"
  },
  title: {
    type: String,
    defaultValue: "",
    label: "Product Title"
  },
  pageTitle: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  },
  originCountry: {
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
    type: [Metafield],
    optional: true
  },
  positions: {
    type: Object, // ProductPosition
    blackbox: true,
    optional: true
  },
  // Denormalized field: object with range string, min and max
  price: {
    label: "Price",
    type: PriceRange
  },
  // Denormalized field: Indicates when at least one of variants
  // `inventoryQuantity` are lower then their `lowInventoryWarningThreshold`.
  // This is some kind of marketing course.
  isLowQuantity: {
    label: "Indicates that the product quantity is too low",
    type: Boolean,
    optional: true
  },
  // Denormalized field: Indicates when all variants `inventoryQuantity` is zero
  isSoldOut: {
    label: "Indicates when the product quantity is zero",
    type: Boolean,
    optional: true
  },
  // Denormalized field. It is `true` if product not in stock, but customers
  // anyway could order it.
  isBackorder: {
    label: "Indicates when the seller has allowed the sale of product which" +
    " is not in stock",
    type: Boolean,
    optional: true
  },
  requiresShipping: {
    label: "Require a shipping address",
    type: Boolean,
    defaultValue: true,
    optional: true
  },
  parcel: {
    type: ShippingParcel,
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
      let slug = getSlug(this.value);

      if (!slug && this.siblingField("title").value) {
        slug = getSlug(this.siblingField("title").value);
      } else if (!slug) {
        slug = this.siblingField("_id").value || Random.id();
      }
      if (this.isInsert) {
        return slug;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: slug
        };
      }
    }
  },
  isDeleted: {
    type: Boolean,
    index: 1,
    defaultValue: false
  },
  isVisible: {
    type: Boolean,
    index: 1,
    defaultValue: false
  },
  template: {
    label: "Template",
    type: String,
    defaultValue: "productDetailSimple"
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
    type: Workflow,
    optional: true
  }
});
