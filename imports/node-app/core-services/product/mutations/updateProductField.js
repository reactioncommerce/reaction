import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  field: String,
  productId: String,
  shopId: String,
  value: SimpleSchema.oneOf(String, Object, Array, Boolean, Number)
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
  const { collections, userHasPermission } = context;
  const { Products } = collections;
  const { field, productId, shopId, value } = input;

  // Check that user has permission to create product
  if (!userHasPermission(["createProduct", "product/admin", "product/update"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const product = await Products.findOne({ _id: productId, shopId });
  if (!product) throw new ReactionError("not-found", "Product not found");

  return product;

  // WE HERE WE HERE WE HERE
  // WE HERE WE HERE WE HERE
  // WE HERE WE HERE WE HERE
  // WE HERE WE HERE WE HERE
  // WE HERE WE HERE WE HERE

  // const newProductId = Random.id();
  // const newProduct = {
  //   _id: newProductId,
  //   shopId,
  //   type: "simple"
  // };

  // // Create a product
  // const createdProductId = await createProductOrVariant(context, newProduct);

  // // Get full product document to create variant
  // const createdProduct = await Products.findOne({ _id: createdProductId });

  // if (!createdProduct) {
  //   throw new ReactionError("server-error", "Unable to find created product");
  // }

  // // Create a product variant
  // const newVariantId = Random.id();
  // const createdVariantId = await createProductOrVariant(context, {
  //   _id: newVariantId,
  //   ancestors: [createdProductId],
  //   shopId,
  //   type: "variant" // needed for multi-schema
  // }, { product: createdProduct, parentVariant: null, isOption: false });

  // if (!createdVariantId) {
  //   throw new ReactionError("server-error", "Unable to create product variant");
  // }

  // return createdProduct;



}










// /**
//    * @name products/updateProductField
//    * @memberof Methods/Products
//    * @method
//    * @summary update single product or variant field
//    * @param {String} _id - product._id or variant._id to update
//    * @param {String} field - key to update
//    * @param {*} value - update property value
//    * @todo rename it to something like "products/updateField" to  reflect
//    * @todo we need to know which type of entity field belongs. For that we could
//    * do something like: const type = Products.findOne(_id).type or transmit type
//    * as param if it possible
//    * latest changes. its used for products and variants
//    * @returns {Number} returns update result
//    */
//   "products/updateProductField"(_id, field, value) {
//     check(_id, String);
//     check(field, String);
//     check(value, Match.OneOf(String, Object, Array, Boolean, Number));

//     // Check first if Product exists and then if user has the right to alter it
//     const doc = Products.findOne({ _id });
//     if (!doc) {
//       throw new ReactionError("not-found", "Product not found");
//     }

//     if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, doc.shopId)) {
//       throw new ReactionError("access-denied", "Access Denied");
//     }

//     const { type } = doc;
//     let update;
//     // handle booleans with correct typing
//     if (value === "false" || value === "true") {
//       const booleanValue = value === "true" || value === true;
//       update = EJSON.parse(`{"${field}":${booleanValue}}`);
//     } else if (field === "handle") {
//       update = {
//         // TODO: write function to ensure new handle is unique.
//         // Should be a call similar to the line below.
//         [field]: createHandle(Reaction.getSlug(value), _id) // handle should be unique
//       };
//     } else if (field === "title" && !doc.handle) {
//       // update handle once title is set
//       const handle = createHandle(Reaction.getSlug(value), _id);
//       update = {
//         [field]: value,
//         handle
//       };
//     } else {
//       const stringValue = EJSON.stringify(value);
//       update = EJSON.parse(`{"${field}":${stringValue}}`);
//     }

//     // we need to use sync mode here, to return correct error and result to UI
//     let result;
//     try {
//       result = updateCatalogProduct(
//         this.userId,
//         {
//           _id
//         },
//         {
//           $set: update
//         },
//         {
//           selector: { type }
//         }
//       );
//     } catch (err) {
//       throw new ReactionError("server-error", err.message);
//     }

//     // If we get a result from the product update, emit update events
//     if (result === 1) {
//       if (type === "variant") {
//         appEvents.emit("afterVariantUpdate", { _id, field, value });
//       } else {
//         appEvents.emit("afterProductUpdate", { _id, field, value });
//       }
//     }

//     return update;
//   },
