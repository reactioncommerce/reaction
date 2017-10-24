import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "./helpers";
import { Document, Notes } from "./orders";
import { Metafield } from "./metafield";
import { Workflow } from "./workflow";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Inventory
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} _id optional, inserted by Mongo, we need it for schema validation
 * @property {String} shopId required, Inventory shopId
 * @property {String} productId required
 * @property {String} variantId required
 * @property {String} orderItemId optional
 * @property {Workflow} workflow optional
 * @property {String} sku optional
 * @property {Metafield[]} metafields optional
 * @property {Document[]} documents optional
 * @property {Notes[]} notes optional
 * @property {Date} createdAt optional, but consider it temporary: schema validation failing in method with required
 * @property {Date} updatedAt optional
 */
export const Inventory = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  shopId: {
    type: String,
    autoValue: shopIdAutoValue,
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
    type: Workflow,
    optional: true
  },
  sku: {
    label: "sku",
    type: String,
    optional: true
  },
  metafields: {
    type: [Metafield],
    optional: true
  },
  documents: {
    type: [Document],
    optional: true
  },
  notes: {
    type: [Notes],
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true,
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

registerSchema("Inventory", Inventory);
