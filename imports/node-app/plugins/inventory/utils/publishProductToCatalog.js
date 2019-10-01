import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Publishes our plugin-specific product fields to the catalog
 * @param {Object} catalogProduct The catalog product that is being built. Should mutate this.
 * @param {Object} input Input data
 * @returns {undefined}
 */
export default async function publishProductToCatalog(catalogProduct, { context }) {
  const { productId, shopId } = catalogProduct;
  // If the product being published does not have variants, do not
  // attempt to publish inventory information.
  if (!catalogProduct.variants.length) return;

  // Most inventory information is looked up and included at read time, when
  // preparing a response to a GraphQL query, but we need to store some
  // boolean flags in the Catalog collection to enable sorting
  // catalogItems query results by them and to have them in Elasticsearch.
  // Build a productConfigurations array based on what's currently in `catalogProduct` object
  const productConfigurations = [];
  catalogProduct.variants.forEach((variant) => {
    productConfigurations.push({
      isSellable: !variant.options || variant.options.length === 0,
      productId,
      productVariantId: variant.variantId
    });

    if (variant.options) {
      variant.options.forEach((option) => {
        productConfigurations.push({
          isSellable: true,
          productId,
          productVariantId: option.variantId
        });
      });
    }
  });

  // Retrieve inventory information for all top level variants and all options
  const topVariantsAndOptionsInventory = await context.queries.inventoryForProductConfigurations(context, {
    fields: ["isBackorder", "isLowQuantity", "isSoldOut"],
    productConfigurations,
    shopId
  });

  // Add inventory properties to the top level parent product.
  catalogProduct.isBackorder = topVariantsAndOptionsInventory.every(({ inventoryInfo }) => inventoryInfo.isBackorder);
  catalogProduct.isLowQuantity = topVariantsAndOptionsInventory.some(({ inventoryInfo }) => inventoryInfo.isLowQuantity);
  catalogProduct.isSoldOut = topVariantsAndOptionsInventory.every(({ inventoryInfo }) => inventoryInfo.isSoldOut);

  // add inventory props to each top level Variant
  catalogProduct.variants.forEach((variant) => {
    // attempt to find this variant's inventory info
    const foundVariantInventory = topVariantsAndOptionsInventory.find((inventoryInfo) =>
      inventoryInfo.productConfiguration.productVariantId === variant.variantId);

    // This should never happen but we include a check to be safe
    if (!foundVariantInventory || !foundVariantInventory.inventoryInfo) {
      throw new ReactionError("inventory-info-not-found", `Inventory info not found for variant with ID: ${variant.variantId}`);
    }

    // if inventory info was found, add to variant
    variant.isSoldOut = foundVariantInventory.inventoryInfo.isSoldOut;

    // add inventory props to each top level option
    if (variant.options) {
      variant.options.forEach((option) => {
        const foundOptionInventory = topVariantsAndOptionsInventory.find((inventoryInfo) =>
          inventoryInfo.productConfiguration.productVariantId === option.variantId);

        // This should never happen but we include a check to be safe
        if (!foundOptionInventory || !foundOptionInventory.inventoryInfo) {
          throw new ReactionError("inventory-info-not-found", `Inventory info not found for option with ID: ${option.variantId}`);
        }

        // if inventory info was found, add to option
        option.isSoldOut = foundOptionInventory.inventoryInfo.isSoldOut;
      });
    }
  });
}
