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
    productConfigurations.push({
      isSellable: true,
      productId: item.productConfiguration.productId,
      variantId: item.productConfiguration.productVariantId
    });
  }

  const variantsInventoryInfo = await context.queries.inventoryForProductConfigurations(context, {
    productConfigurations
  });

  for (const item of items) {
    const { inventoryInfo: variantInventoryInfo } = variantsInventoryInfo.find(({ productConfiguration }) =>
      productConfiguration.variantId === item.productConfiguration.productVariantId);
    Object.getOwnPropertyNames(variantInventoryInfo).forEach((key) => {
      item[key] = variantInventoryInfo[key];
    });
  }
}
