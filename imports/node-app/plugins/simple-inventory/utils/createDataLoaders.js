import _ from "lodash";

/**
  * @param {Object} context An object with request-specific state
  * @param {Function} dataloaderFactory dataloader factory
  * @returns {Array} converted result
  */
export default function createDataLoaders(context, dataloaderFactory) {
  return {
    SimpleInventoryByProductVariantId: dataloaderFactory(async (productVariantIds) => {
      const results = await context.collections.SimpleInventory.find({
        "productConfiguration.productVariantId": { $in: productVariantIds }
      }).toArray();
      const byVariantId = _.keyBy(results, (inventoryDoc) => inventoryDoc.productConfiguration.productVariantId);
      return productVariantIds.map((variantId) => (byVariantId[variantId] ? byVariantId[variantId] : null));
    })
  };
}
