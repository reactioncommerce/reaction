import SimpleSchema from "simpl-schema";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import ReactionError from "@reactioncommerce/reaction-error";
import createHandle from "../utils/createHandle.js";

const metafieldInputSchema = new SimpleSchema({
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

const inputSchema = new SimpleSchema({
  "description": {
    type: String,
    optional: true
  },
  "facebookMsg": {
    type: String,
    optional: true,
    max: 255
  },
  "googleplusMsg": {
    type: String,
    optional: true,
    max: 255
  },
  "handle": {
    type: String,
    optional: true
  },
  "hashtags": {
    type: Array,
    optional: true
  },
  "hashtags.$": {
    type: String
  },
  "isDeleted": {
    type: Boolean,
    optional: true
  },
  "isVisible": {
    type: Boolean,
    optional: true
  },
  "metaDescription": {
    type: String,
    optional: true
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": metafieldInputSchema,
  "originCountry": {
    type: String,
    optional: true
  },
  "pageTitle": {
    type: String,
    optional: true
  },
  "pinterestMsg": {
    type: String,
    optional: true,
    max: 255
  },
  "productType": {
    type: String,
    optional: true
  },
  "supportedFulfillmentTypes": {
    type: Array,
    optional: true
  },
  "supportedFulfillmentTypes.$": {
    type: String,
    allowedValues: ["shipping", "digital", "pickup"]
  },
  "title": {
    type: String,
    optional: true
  },
  "twitterMsg": {
    type: String,
    optional: true,
    max: 140
  },
  "vendor": {
    type: String,
    optional: true
  }
});


/**
 * @method updateProduct
 * @summary Updates a product
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.field - product field to update
 * @param {String} input.productId - productId of product to update
 * @param {String} input.shopId - shopId of shop product belongs to
 * @param {String} input.value - value to update field with
 * @return {Promise<Object>} updateProduct payload
 */
export default async function updateProduct(context, input) {
  const { appEvents, collections } = context;
  const { Products } = collections;
  const { product: productInput, productId, shopId } = input;

  // Check that user has permission to create product
  await context.validatePermissions(
    `reaction:legacy:products:${productId}`,
    "update",
    { shopId }
  );

  const currentProduct = await Products.findOne({ _id: productId, shopId });
  if (!currentProduct) throw new ReactionError("not-found", "Product not found");

  const updateDocument = { ...productInput };

  // Slugify the handle input
  if (typeof productInput.slug === "string") {
    updateDocument.handle = await createHandle(context, getSlug(productInput.slug), productId, shopId);
    delete updateDocument.slug;
  }

  // If a title is supplied, and the currently stored product doesn't have a handle,
  // then slugify the title and save it as the new handle (slug)
  if (typeof productInput.title === "string" && !currentProduct.handle && !updateDocument.handle) {
    updateDocument.handle = await createHandle(context, getSlug(productInput.title), productId, shopId);
  }

  if (Object.keys(updateDocument).length === 0) {
    throw new ReactionError("invalid-param", "At least one field to update must be provided");
  }

  inputSchema.validate(updateDocument);

  updateDocument.updatedAt = new Date();

  const { value: updatedProduct } = await Products.findOneAndUpdate(
    {
      _id: productId,
      shopId
    },
    {
      $set: updateDocument
    },
    {
      returnOriginal: false
    }
  );

  await appEvents.emit("afterProductUpdate", { productId, product: updatedProduct });

  return updatedProduct;
}
