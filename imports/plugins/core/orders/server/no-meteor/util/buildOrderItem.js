import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Builds an order item
 * @param {Object} context an object containing the per-request state
 * @param {String} currencyCode The order currency code
 * @param {Object} inputItem Order item input. See schema.
 * @returns {Promise<Object>} An order item, matching the schema needed for insertion in the Orders collection
 */
export default async function buildOrderItem(context, { currencyCode, inputItem }) {
  const {
    addedAt,
    price,
    productConfiguration,
    quantity
  } = inputItem;

  const {
    catalogProduct: chosenProduct,
    catalogProductVariant: chosenVariant,
    price: finalPrice
  } = await context.queries.getCurrentCatalogPriceForProductConfiguration(productConfiguration, currencyCode, context.collections);

  if (finalPrice !== price) {
    throw new ReactionError("invalid", `Provided price for the "${chosenVariant.title}" item does not match current published price`);
  }

  if (!chosenVariant.canBackorder && (quantity > chosenVariant.inventoryAvailableToSell)) {
    throw new ReactionError("invalid-order-quantity", `Quantity ordered is more than available inventory for  "${chosenVariant.title}"`);
  }

  const now = new Date();
  const newItem = {
    _id: Random.id(),
    addedAt: addedAt || now,
    createdAt: now,
    optionTitle: chosenVariant && chosenVariant.optionTitle,
    parcel: chosenVariant.parcel,
    price: {
      amount: finalPrice,
      currencyCode
    },
    productId: chosenProduct.productId,
    productSlug: chosenProduct.slug,
    productType: chosenProduct.type,
    productTagIds: chosenProduct.tagIds,
    productVendor: chosenProduct.vendor,
    quantity,
    shopId: chosenProduct.shopId,
    subtotal: quantity * finalPrice,
    title: chosenProduct.title,
    updatedAt: now,
    variantId: chosenVariant.variantId,
    variantTitle: chosenVariant.title,
    workflow: { status: "new", workflow: ["coreOrderWorkflow/created", "coreItemWorkflow/removedFromInventoryAvailableToSell"] }
  };

  for (const func of context.getFunctionsOfType("mutateNewOrderItemBeforeCreate")) {
    await func(context, { chosenProduct, chosenVariant, item: newItem }); // eslint-disable-line no-await-in-loop
  }

  return newItem;
}
