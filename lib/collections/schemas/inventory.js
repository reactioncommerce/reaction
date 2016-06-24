import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "./helpers";
import { Document, Notes } from "./orders";
import { Metafield } from "./metafield";
import { Workflow } from "./workflow";

export const Inventory = new SimpleSchema({
  _id: {
    type: String,
    optional: true // inserted by mongo, we need it for schema validation
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
