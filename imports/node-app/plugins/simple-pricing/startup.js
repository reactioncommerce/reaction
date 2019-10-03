import collectionIndex from "@reactioncommerce/api-utils/collectionIndex.js";
import getProductPriceRange from "./util/getProductPriceRange.js";
import getVariantPriceRange from "./util/getVariantPriceRange.js";

const fieldsThatChangeAncestorPricing = ["isDeleted", "isVisible", "price"];

/**
 * @method startup
 * @summary Simple pricing startup function.
 * @param {Object} context - App context.
 * @returns {undefined} - void, no return.
 */
export default async function startup(context) {
  const { appEvents, collections } = context;
  const { Catalog, Products, Shops } = collections;

  // Add an index to support built-in minPrice sorting for the primary shop's
  // default currency code only.
  const shop = await Shops.findOne({ shopType: "primary" });
  if (shop && shop.currency) {
    collectionIndex(Catalog, {
      [`product.pricing.${shop.currency}.minPrice`]: 1,
      _id: 1
    });
  }

  /**
   * Updates the `price` field for a Products collection product based on its
   * updated variants.
   * @param {Object} variant The updated variant object
   * @returns {undefined}
   */
  async function updateProductPrice(variant) {
    const productDocs = await Products.find({
      $or: [
        { _id: { $in: variant.ancestors } },
        { ancestors: { $in: variant.ancestors } }
      ]
    }).toArray();

    // productDocs has all sibling and ancestor docs from Products.
    // We now want to update `price` field only for those that are
    // not siblings.
    /* eslint-disable no-await-in-loop */
    for (const productDoc of productDocs) {
      if (productDoc.ancestors.length < variant.ancestors.length) {
        let price;
        if (productDoc.ancestors.length === 0) {
          price = getProductPriceRange(productDoc._id, productDocs);
        } else {
          price = getVariantPriceRange(productDoc._id, productDocs);
        }

        await Products.updateOne({ _id: productDoc._id }, {
          $set: { price }
        });
      }
    }
    /* eslint-enable no-await-in-loop */
  }

  // Listen for variant soft deletion from the Products collection, and recalculate
  // the price range for the parent variant and product
  appEvents.on("afterVariantSoftDelete", async ({ variant }) => updateProductPrice(variant));

  // Listen for variant price changes in the Products collection, and recalculate
  // the price range for the parent variant and product
  appEvents.on("afterVariantUpdate", async ({ _id, field }) => {
    if (!fieldsThatChangeAncestorPricing.includes(field)) return;

    const variant = await Products.findOne({ _id });
    await updateProductPrice(variant);
  });
}
