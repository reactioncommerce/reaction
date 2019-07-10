import _ from "lodash";

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
