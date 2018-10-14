import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import * as Schemas from "/imports/collections/schemas";
import { createProductHash } from "../mutations/hashProduct";
import createCatalogProduct from "./createCatalogProduct";

/**
 * @method publishProductToCatalog
 * @summary Publish a product to the Catalog collection
 * @memberof Catalog
 * @param {Object} product - A product object
 * @param {Object} collections - Raw mongo collections
 * @return {boolean} true on successful publish, false if publish was unsuccessful
 */
export default async function publishProductToCatalog(product, collections) {
  const { Catalog, Products } = collections;

  // Convert Product schema object to Catalog schema object
  const catalogProduct = await createCatalogProduct(product, collections);

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

  Schemas.Catalog.validate(modifier, { modifier: true });

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
    const productHash = await createProductHash(product, collections);

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
    Hooks.Events.run("afterPublishProductToCatalog", updatedProduct, catalogProduct);
  }

  return wasUpdateSuccessful;
}
