/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { Catalog, Products } = collections;

  // Whenever inventory is updated for any sellable variant, the plugin that did the update is
  // expected to emit `afterInventoryUpdate`. We listen for this and keep the boolean fields
  // on the CatalogProduct correct.
  appEvents.on("afterInventoryUpdate", async ({ productConfiguration }) => {
    const { productId } = productConfiguration;

    const variants = await Products.find({
      ancestors: productId,
      isDeleted: { $ne: true },
      isVisible: true
    }, {
      _id: 1,
      ancestors: 1,
      shopId: 1
    }).toArray();

    const topVariants = variants.filter((variant) => variant.ancestors.length === 1);
    if (topVariants.length === 0) return;

    const topVariantsInventoryInfo = await context.queries.inventoryForProductConfigurations(context, {
      fields: ["isBackorder", "isLowQuantity", "isSoldOut"],
      productConfigurations: topVariants.map((option) => ({
        isSellable: !variants.some((variant) => variant.ancestors.includes(option._id)),
        productId: option.ancestors[0],
        productVariantId: option._id
      })),
      shopId: topVariants[0].shopId
    });

    await Catalog.updateOne({ "product.productId": productId }, {
      $set: {
        "product.isBackorder": topVariantsInventoryInfo.every(({ inventoryInfo }) => inventoryInfo.isBackorder),
        "product.isLowQuantity": topVariantsInventoryInfo.some(({ inventoryInfo }) => inventoryInfo.isLowQuantity),
        "product.isSoldOut": topVariantsInventoryInfo.every(({ inventoryInfo }) => inventoryInfo.isSoldOut)
      }
    });
  });
}
