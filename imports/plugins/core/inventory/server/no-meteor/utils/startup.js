/**
 * @summary Updates `isBackorder`, `isSoldOut`, and `isLowQuantity` as necessary for
 *   a single CatalogProduct. Call this whenever inventory changes for one or more
 *   variants of a product.
 * @param {Object} context App context
 * @param {String} productId The product ID
 * @return {undefined}
 */
async function updateInventoryBooleansInCatalog(context, productId) {
  const { collections: { Catalog, Products } } = context;

  const variants = await Products.find({
    ancestors: productId,
    isDeleted: { $ne: true },
    isVisible: true
  }, {
    _id: 1,
    ancestors: 1,
    shopId: 1
  }).toArray();

  const topVariantsAndTopOptions = variants.filter((variant) => variant.ancestors.length === 1 || variant.ancestors.length === 2);
  if (topVariantsAndTopOptions.length === 0) return;

  const variantsOptionsInventory = await context.queries.inventoryForProductConfigurations(context, {
    fields: ["isBackorder", "isLowQuantity", "isSoldOut"],
    productConfigurations: topVariantsAndTopOptions.map((option) => ({
      isSellable: !variants.some((variant) => variant.ancestors.includes(option._id)),
      productId: option.ancestors[0],
      productVariantId: option._id
    })),
    shopId: topVariantsAndTopOptions[0].shopId
  });

  const catalogProduct = await Catalog.findOne({ "product.productId": productId }, { "product.variants": 1 });

  // Update inventory for the parent product and all variants and options.
  // If no inventory information is found for a variant or option, it is not mutated.
  const updatedVariants = [];
  catalogProduct.product.variants.forEach((variant) => {
    // Keep variant un-mutated by default
    let updatedVariant = variant;
    const foundVariantInventory = variantsOptionsInventory.find((inventoryInfo) => inventoryInfo.productConfiguration.productVariantId === variant._id);

    if (foundVariantInventory) {
      updatedVariant = {
        ...variant,
        isSoldOut: foundVariantInventory.inventoryInfo.isSoldOut
      };
    }

    const updatedOptions = [];
    if (updatedVariant.options) {
      updatedVariant.options.forEach((option) => {
        // Keep option un-mutated by default
        let updatedOption = option;
        const foundOptionInventory = variantsOptionsInventory.find((inventoryInfo) => inventoryInfo.productConfiguration.productVariantId === option._id);

        if (foundOptionInventory) {
          updatedOption = {
            ...option,
            isSoldOut: foundOptionInventory.inventoryInfo.isSoldOut
          };
        }

        updatedOptions.push(updatedOption);
      });

      updatedVariant.options = updatedOptions;
    }

    updatedVariants.push(updatedVariant);
  });

  await Catalog.updateOne({ "product.productId": productId }, {
    $set: {
      "product.isBackorder": variantsOptionsInventory.every(({ inventoryInfo }) => inventoryInfo.isBackorder),
      "product.isLowQuantity": variantsOptionsInventory.some(({ inventoryInfo }) => inventoryInfo.isLowQuantity),
      "product.isSoldOut": variantsOptionsInventory.every(({ inventoryInfo }) => inventoryInfo.isSoldOut),
      "product.variants": updatedVariants
    }
  });
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents } = context;

  // Whenever inventory is updated for any sellable variant, the plugin that did the update is
  // expected to emit `afterInventoryUpdate`. We listen for this and keep the boolean fields
  // on the CatalogProduct correct.
  appEvents.on("afterInventoryUpdate", async ({ productConfiguration }) =>
    updateInventoryBooleansInCatalog(context, productConfiguration.productId));

  appEvents.on("afterBulkInventoryUpdate", async ({ productConfigurations }) => {
    // Since it is a bulk update and many of the product configurations may be for the same
    // productId, we can avoid unnecessary work by running the update only once per productId.
    const uniqueProductIds = productConfigurations.reduce((list, productConfiguration) => {
      const { productId } = productConfiguration;
      if (!list.includes(productId)) {
        list.push(productId);
      }
      return list;
    }, []);
    uniqueProductIds.forEach((productId) => {
      updateInventoryBooleansInCatalog(context, productId);
    });
  });
}
