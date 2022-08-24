import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { createProductHash } from "../mutations/hashProduct.js";
import { Catalog as CatalogSchema } from "../simpleSchemas.js";
import createCatalogProduct from "./createCatalogProduct.js";

/**
 * @method publishProductToCatalog
 * @summary Publish a product to the Catalog collection
 * @memberof Catalog
 * @param {Object} product - A product object
 * @param {Object} context - The app context
 * @returns {boolean} true on successful publish, false if publish was unsuccessful
 */
export default async function publishProductToCatalog(product, context) {
  const { appEvents, collections } = context;
  const { Catalog, Products } = collections;

  const startTime = Date.now();

  // Convert Product schema object to Catalog schema object
  const catalogProduct = await createCatalogProduct(product, context);

  // Check to see if product has variants
  // If not, do not publish the product to the Catalog
  if (!catalogProduct.variants || (catalogProduct.variants && catalogProduct.variants.length === 0)) {
    Logger.info("Cannot publish to catalog: product has no visible variants");
    return false;
  }

  const modifier = {
    $set: {
      product: catalogProduct,
      shopId: catalogProduct.shopId,
      updatedAt: new Date()
    },
    $setOnInsert: {
      _id: Random.id(),
      createdAt: new Date()
    }
  };

  CatalogSchema.validate(modifier, { modifier: true });

  // Insert/update catalog document
  const result = await Catalog.updateOne(
    {
      "product.productId": catalogProduct.productId
    },
    modifier,
    { upsert: true }
  );

  const wasUpdateSuccessful = result && result.result && result.result.ok === 1;
  if (wasUpdateSuccessful) {
    // Update the Product hashes so that we know there are now no unpublished changes
    const productHash = await createProductHash(product, context.collections);

    const now = new Date();
    const productUpdates = {
      currentProductHash: productHash,
      publishedAt: now,
      publishedProductHash: productHash,
      updatedAt: now
    };

    const productUpdateResult = await Products.updateOne({ _id: product._id }, { $set: productUpdates });
    if (!productUpdateResult || !productUpdateResult.result || productUpdateResult.result.ok !== 1) {
      Logger.error(`Failed to update product hashes for product with ID ${product._id}`, productUpdateResult && productUpdateResult.result);
    }

    const updatedProduct = { ...product, ...productUpdates };

    // For bulk publication, we need to await this so that we know when all of the
    // things this triggers are done, and we can publish the next one.
    await appEvents.emit("afterPublishProductToCatalog", {
      catalogProduct,
      product: updatedProduct
    });

    Logger.debug({
      name: "cart",
      ms: Date.now() - startTime,
      productId: catalogProduct.productId
    }, "publishProductToCatalog finished");
  }

  return wasUpdateSuccessful;
}
