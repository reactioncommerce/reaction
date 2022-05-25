import ProductData from "../json-data/Products.json";
import Logger from "@reactioncommerce/logger";

const now = new Date();

/**
 * @summary publishes Products data to catalog
 * @param {Object} context - The application context
 * @param {Object} productData - The product data to publish
 * @returns {Promise<boolean>} true if success
 */

async function publishSampleProducts(productData, context) {
  const { mutations: { publishProducts } } = context;
  for (const product of productData) {
    if (!product.isDeleted && product.isVisible && product.type === "simple") {
        try {
          await publishProducts(context.getInternalContext(), [product._id]);
        } catch (error) {
          Logger.warn("Error publishing product: ", product._id);
        }
    }
  }
  return true;
}

/**
 * @summary load Products data
 * @param {Object} context - The application context
 * @returns {Promise<boolean>} true if success
 */
export default async function loadProducts(context, shopId) {
  const { simpleSchemas: { Product: ProductSchema, ProductVariant: ProductVariantSchema }, collections: { Products } } = context;
  const { appEvents } = context;
  const priceField = ['price'];
  let variantsToUpdate = [];

  ProductData.forEach((product) => {
    product.createdAt = now;
    product.updatedAt = now;
    product.shopId = shopId;
    if (product.type === "simple") {
      product.publishedAt = now;
      ProductSchema.validate(product);
    } else if (product.type === "variant") {
      if (typeof product.price === "number") {
        ProductVariantSchema.validate(product);
      }  else {
        Logger.warn("Error - Variant with price object: ", product._id);
      }
      const emitEventData = {
        fields: priceField,
        productId: product.ancestors[0],
        productVariant: product,
        productVariantId: product._id
      };
      variantsToUpdate.push(emitEventData);
    }
  });
  await Products.insertMany(ProductData);

  await Promise.all(variantsToUpdate.map(async (emitEventData) => {
    await appEvents.emit("afterVariantUpdate", emitEventData);
  }));

  await publishSampleProducts(ProductData, context);

  return true;
}
