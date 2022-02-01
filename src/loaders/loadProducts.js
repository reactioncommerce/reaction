import ProductData from "../json-data/Products.json";

const now = new Date();

/**
 * @summary load Products data
 * @param {Object} context - The application context
 * @returns {Promise<boolean>} true if success
 */
export default async function loadProducts(context) {
  const { collections: { Products } } = context;
  ProductData.forEach((product) => {
    product.createdAt = now;
    product.updatedAt = now;
    product.publishedAt = now;
  });
  Products.insertMany(ProductData);
  return true;
}
