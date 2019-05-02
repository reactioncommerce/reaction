/**
 * @summary Mutates an array of CartItem to add inventory fields at read time
 * @param {Object} context App context
 * @param {Object[]} items An array of CartItem objects
 * @param {Object} info Additional info
 * @return {undefined} Returns nothing. Potentially mutates `items`
 */
export default async function xformCartItems(context, items) {
  const productConfigurations = [];
  for (const item of items) {
    productConfigurations.push({ ...item.productConfiguration, isSellable: true });
  }

  const variantsInventoryInfo = await context.queries.inventoryForProductConfigurations(context, {
    productConfigurations
  });

  for (const item of items) {
    const { inventoryInfo: variantInventoryInfo } = variantsInventoryInfo.find(({ productConfiguration }) =>
      productConfiguration.productVariantId === item.productConfiguration.productVariantId);
    Object.getOwnPropertyNames(variantInventoryInfo).forEach((key) => {
      item[key] = variantInventoryInfo[key];
    });

    // Set deprecated `currentQuantity` for now
    item.currentQuantity = item.inventoryAvailableToSell;
  }
}
