import getTopLevelVariant from "/imports/plugins/core/catalog/server/no-meteor/utils/getTopLevelVariant";
import getProductInventoryAvailableToSellQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/getProductInventoryAvailableToSellQuantity.js";
import getVariantInventoryAvailableToSellQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/getVariantInventoryAvailableToSellQuantity";

/**
 *
 * @method updateParentVariantsInventoryAvailableToSellQuantity
 * @summary Get the number of product variants that are currently reserved in an order.
 * This function can take any variant object.
 * @param {Object} item - A product item object, either from the cart or the products catalog
 * @param {Object} collections - Raw mongo collections.
 * @return {Promise<number>} Reserved variant quantity.
 */
export default async function updateParentVariantsInventoryAvailableToSellQuantity(item, collections) {
  // Since either a cart item or a product catalog item can be provided, we need to determine
  // the parent based on different data
  // If this is a cart item, `productId` and `variantId` are fields on the object
  // If this is a product object, _id is the equivalent of `variantId`, and `ancestors[0]` is the productId
  let productId;
  let variantId;
  if (item.variantId && item.productId) {
    productId = item.productId;
    variantId = item.variantId;
  } else {
    productId = item.ancestors[0];
    variantId = item._id;
  }

  // Check to see if this item is the top level variant, or an option
  const topLevelVariant = await getTopLevelVariant(variantId, collections);

  // If item is an option, update the quantity on its parent variant too
  if (topLevelVariant._id !== item._id) {
    const variantInventoryAvailableToSellQuantity = await getVariantInventoryAvailableToSellQuantity(topLevelVariant, collections);

    await collections.Products.updateOne(
      {
        _id: topLevelVariant._id
      },
      {
        $set: {
          inventoryAvailableToSell: variantInventoryAvailableToSellQuantity
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
  const productInventoryAvailableToSellQuantity = await getProductInventoryAvailableToSellQuantity(productId, collections);

  await collections.Products.updateOne(
    {
      _id: productId
    },
    {
      $set: {
        inventoryAvailableToSell: productInventoryAvailableToSellQuantity
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
