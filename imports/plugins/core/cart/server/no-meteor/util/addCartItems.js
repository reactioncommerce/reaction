import Random from "@reactioncommerce/random";
import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import findProductAndVariant from "/imports/plugins/core/catalog/server/no-meteor/utils/findProductAndVariant";

const inputItemSchema = new SimpleSchema({
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Object,
    blackbox: true
  },
  "productConfiguration": Object,
  "productConfiguration.productId": String,
  "productConfiguration.productVariantId": String,
  "quantity": SimpleSchema.Integer,
  "price": Object,
  "price.currencyCode": String,
  "price.amount": {
    type: Number,
    optional: true
  }
});

/**
 * @summary Given a list of current cart items and a list of items a shopper wants
 *   to add, validate available quantities and return the full merged list.
 * @param {Object} collections - Map of raw MongoDB collections
 * @param {Object[]} currentItems - Array of current items in CartItem schema
 * @param {Object[]} inputItems - Array of items to add in CartItemInput schema
 * @param {Object} [options] - Options
 * @param {Boolean} [options.skipPriceCheck] - For backwards compatibility, set to `true` to skip checking price.
 *   Skipping this is not recommended for new code.
 * @return {Object} Object with `incorrectPriceFailures` and `minOrderQuantityFailures` and `updatedItemList` props
 */
export default async function addCartItems(collections, currentItems, inputItems, options = {}) {
  inputItemSchema.validate(inputItems);

  const incorrectPriceFailures = [];
  const minOrderQuantityFailures = [];
  const updatedItemList = currentItems.slice(0);

  const currentDateTime = new Date();

  const promises = inputItems.map(async (inputItem) => {
    const { metafields, productConfiguration, quantity, price } = inputItem;
    const { productId, productVariantId } = productConfiguration;

    // Get the published product from the DB, in order to get variant title and check price.
    // This could be done outside of the loop to reduce db hits, but 99% of the time inputItems
    // will have only one item, so we can skip that optimization for now in favor of cleaner code.
    const {
      catalogProduct,
      parentVariant,
      variant: chosenVariant
    } = await findProductAndVariant(collections, productId, productVariantId);

    const variantPriceInfo = chosenVariant.pricing[price.currencyCode];
    if (!variantPriceInfo) {
      throw new ReactionError("invalid-param", `This product variant does not have a price for ${price.currencyCode}`);
    }

    if (options.skipPriceCheck !== true && variantPriceInfo.price !== price.amount) {
      incorrectPriceFailures.push({
        currentPrice: {
          amount: variantPriceInfo.price,
          currencyCode: price.currencyCode
        },
        productConfiguration,
        providedPrice: price
      });
      return;
    }

    // Check minimum order quantity
    const minOrderQuantity = chosenVariant.minOrderQuantity || 1;
    if (quantity < minOrderQuantity) {
      minOrderQuantityFailures.push({
        minOrderQuantity,
        productConfiguration,
        quantity
      });
      return;
    }

    // Note that we do not check inventory quantity here. We will assume that the client
    // knows what it is doing and may want to add items that are not available. Quantity
    // checks at the time of placing the order will ensure that unavailable items are
    // not ordered unless back-ordering is enabled.

    // Until we do a more complete attributes revamp, we'll do our best to fudge attributes here.
    // The main issue is we do not have labels.
    const attributes = [];
    if (parentVariant) {
      attributes.push({
        label: null, // Set label to null for now. We expect to use it in the future.
        value: parentVariant.title
      });
    }
    attributes.push({
      label: null, // Set label to null for now. We expect to use it in the future.
      value: chosenVariant.title
    });

    const cartItem = {
      _id: Random.id(),
      attributes,
      isTaxable: chosenVariant.isTaxable || false,
      metafields,
      optionTitle: chosenVariant.optionTitle,
      parcel: chosenVariant.parcel,
      priceWhenAdded: {
        amount: variantPriceInfo.price,
        currencyCode: price.currencyCode
      },
      productId,
      productSlug: catalogProduct.slug,
      productVendor: catalogProduct.vendor,
      productType: catalogProduct.type,
      quantity,
      shopId: catalogProduct.shopId,
      taxCode: chosenVariant.taxCode,
      title: catalogProduct.title,
      updatedAt: currentDateTime,
      variantId: productVariantId,
      variantTitle: chosenVariant.title
    };

    // Check whether this variant is already in the cart. If so, increment quantity.
    const currentMatchingItemIndex = currentItems.findIndex((item) => item.productId === productId && item.variantId === productVariantId);
    if (currentMatchingItemIndex === -1) {
      // These dates should not be overwritten when updating the quantity of an
      // already-added item, so we wait to set them here.
      cartItem.addedAt = currentDateTime;
      cartItem.createdAt = currentDateTime;
      updatedItemList.push(cartItem);
    } else {
      const currentCartItem = updatedItemList[currentMatchingItemIndex];
      updatedItemList[currentMatchingItemIndex] = {
        ...currentCartItem,
        ...cartItem,
        // Combine quantities. This is not atomic like $inc would be, but what are the
        // chances that someone is adding the same item to the same cart in two different
        // browsers at the same time? Doing it this way allows for more functional and
        // testable code.
        quantity: currentCartItem.quantity + cartItem.quantity
      };
    }
  });

  await Promise.all(promises);

  // Always keep most recently added items at the beginning of the list
  updatedItemList.sort((itemA, itemB) => itemA.addedAt.getTime() - itemB.addedAt.getTime());

  return { incorrectPriceFailures, minOrderQuantityFailures, updatedItemList };
}
