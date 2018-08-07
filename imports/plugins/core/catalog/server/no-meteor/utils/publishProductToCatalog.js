import Random from "@reactioncommerce/random";
import * as Schemas from "/imports/collections/schemas";
import Logger from "@reactioncommerce/logger";
import hashProduct from "../mutations/hashProduct";
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
  const { Catalog } = collections;

  // Create hash of all user-editable fields
  const hashedProduct = await hashProduct(product._id, collections);

  // Convert Product schema object to Catalog schema object
  const catalogProduct = await createCatalogProduct(hashedProduct, collections);

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

  // Check against catalog schema
  try {
    Schemas.Catalog.validate(modifier, { modifier: true });
  } catch (err) {
    Logger.error(err);
  }

  // Insert/update catalog document
  const result = await Catalog.updateOne(
    {
      "product.productId": catalogProduct.productId
    },
    modifier,
    { upsert: true }
  );

  return result && result.result && result.result.ok === 1;
}
