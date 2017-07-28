import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Products } from "/lib/collections";
export const ShopifyProduct = new SimpleSchema({
  shopifyId: {
    type: Number,
    optional: true
  }
});

Products.attachSchema(ShopifyProduct, { selector: { type: "simple" } });
