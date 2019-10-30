import EJSON from "ejson";
import SimpleSchema from "simpl-schema";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import ReactionError from "@reactioncommerce/reaction-error";
import createHandle from "../utils/createHandle.js";

const inputSchema = new SimpleSchema({
  "field": String,
  "productId": String,
  "shopId": String,
  "value": SimpleSchema.oneOf(String, Object, Array, Boolean, Number),
  "value.$": {
    type: SimpleSchema.oneOf(String, Object, Boolean, Number),
    optional: true
  }
});

/**
 * @method updateProductField
 * @summary updates a field on a product
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.field - product field to update
 * @param {String} input.productId - productId of product to update
 * @param {String} input.shopId - shopId of shop product belongs to
 * @param {String} input.value - value to update field with
 * @return {Promise<Object>} updateProductField payload
 */
export default async function updateProductField(context, input) {
  inputSchema.validate(input);
  const { appEvents, checkPermissions, collections } = context;
  const { Products } = collections;
  const { field, productId, shopId, value } = input;

  // Check that user has permission to create product
  await checkPermissions(["createProduct", "product/admin", "product/update"], shopId);

  const product = await Products.findOne({ _id: productId, shopId });
  if (!product) throw new ReactionError("not-found", "Product not found");

  let update;
  // handle booleans with correct typing
  if (value === "false" || value === "true") {
    const booleanValue = value === "true" || value === true;
    update = EJSON.parse(`{"${field}":${booleanValue}}`);
  } else if (field === "handle") {
    update = {
      [field]: createHandle(getSlug(value), productId)
    };
  } else if (field === "title" && !product.handle) {
    // update handle once title is set
    const handle = createHandle(getSlug(value), productId);
    update = {
      [field]: value,
      handle
    };
  } else {
    const stringValue = EJSON.stringify(value);
    update = EJSON.parse(`{"${field}":${stringValue}}`);
  }

  const { value: updatedProduct } = await Products.findOneAndUpdate(
    {
      _id: productId
    },
    {
      $set: update
    },
    {
      returnOriginal: false
    }
  );

  if (!updatedProduct) throw new ReactionError("server-error", "Product not updated");

  if (updatedProduct.type === "variant") {
    appEvents.emit("afterVariantUpdate", { productId, field, value });
  } else {
    appEvents.emit("afterProductUpdate", { productId, field, value });
  }

  return updatedProduct;
}
