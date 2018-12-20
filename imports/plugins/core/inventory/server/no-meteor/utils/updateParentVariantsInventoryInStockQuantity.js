import getTopLevelVariant from "/imports/plugins/core/catalog/server/no-meteor/utils/getTopLevelVariant";
import getProductInventoryInStockQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/getProductInventoryInStockQuantity";
import getVariantInventoryInStockQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/getVariantInventoryInStockQuantity";
/**
 *
 * @method updateParentVariantsInventoryInStockQuantity
 * @summary Get the number of product variants that are currently in stock.
 * This function can take any variant object.
 * @param {Object} item - A product item object, either from the cart or the products catalog
 * @param {Object} collections - Raw mongo collections.
 * @return {Promise<number>} Reserved variant quantity.
 */
export default async function updateParentVariantsInventoryInStockQuantity(item, collections) {
  // Since either a cart item or a product catalog item can be provided, we need to determine
  // the parent based on different data
  // If this is a cart item, `productId` and `variantId` are fields on the object
  // If this is a product object, _id is the equivalent of `variantId`, and `ancestors[0]` is the productId
  let updateProductId;
  let updateVariantId;
  if (item.variantId && item.productId) {
    updateProductId = item.productId;
    updateVariantId = item.variantId;
  } else {
    updateProductId = item.ancestors[0]; // eslint-disable-line
    updateVariantId = item._id;
  }

  // Check to see if this item is the top level variant, or an option
  const topLevelVariant = await getTopLevelVariant(updateVariantId, collections);

  // If item is an option, update the quantity on its parent variant too
  if (topLevelVariant._id !== updateVariantId) {
    const variantInventoryInStockQuantity = await getVariantInventoryInStockQuantity(topLevelVariant, collections);

    await collections.Products.updateOne(
      {
        _id: topLevelVariant._id
      },
      {
        $set: {
          inventoryQuantity: variantInventoryInStockQuantity
        }
      },
      {
        publish: true,
        selector: {
          type: "variant"
        }
      }
    );
  }

  // Update the top level product to be the sum of all variant inventory numbers
  const productInventoryInStockQuantity = await getProductInventoryInStockQuantity(updateProductId, collections);

  await collections.Products.updateOne(
    {
      _id: updateProductId
    },
    {
      $set: {
        inventoryQuantity: productInventoryInStockQuantity
      }
    },
    {
      publish: true,
      selector: {
        type: "variant"
      }
    }
  );

  return;
}
