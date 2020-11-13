import accounting from "accounting-js";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Builds an order item
 * @param {Object} context an object containing the per-request state
 * @param {String} currencyCode The order currency code
 * @param {Object} inputItem Order item input. See schema.
 * @param {Object} cart - The cart this order is being built from
 * @returns {Promise<Object>} An order item, matching the schema needed for insertion in the Orders collection
 */
export default async function buildOrderItem(context, { currencyCode, inputItem, cart }) {
  const { queries } = context;
  const {
    addedAt,
    price,
    productConfiguration,
    quantity
  } = inputItem;
  const { productId, productVariantId } = productConfiguration;

  const {
    catalogProduct: chosenProduct,
    parentVariant,
    variant: chosenVariant
  } = await queries.findProductAndVariant(context, productId, productVariantId);

  const variantPriceInfo = await queries.getVariantPrice(context, chosenVariant, currencyCode);
  const finalPrice = (variantPriceInfo || {}).price;

  // Handle null or undefined price returned. Don't allow sale.
  if (!finalPrice && finalPrice !== 0) {
    throw new ReactionError("invalid", `Unable to get current price for "${chosenVariant.title || chosenVariant._id}"`);
  }

  if (finalPrice !== price) {
    throw new ReactionError("invalid", `Provided price for the "${chosenVariant.title}" item does not match current published price`);
  }

  const inventoryInfo = await context.queries.inventoryForProductConfiguration(context, {
    fields: ["canBackorder", "inventoryAvailableToSell"],
    productConfiguration: {
      ...productConfiguration,
      isSellable: true
    },
    shopId: chosenProduct.shopId
  });

  if (!inventoryInfo.canBackorder && (quantity > inventoryInfo.inventoryAvailableToSell)) {
    throw new ReactionError("invalid-order-quantity", `Quantity ordered is more than available inventory for  "${chosenVariant.title}"`);
  }

  // Until we do a more complete attributes revamp, we'll do our best to fudge attributes here.
  const attributes = [];
  if (parentVariant) {
    attributes.push({
      label: parentVariant.attributeLabel,
      value: parentVariant.optionTitle
    });
  }
  attributes.push({
    label: chosenVariant.attributeLabel,
    value: chosenVariant.optionTitle
  });

  const now = new Date();
  const newItem = {
    _id: Random.id(),
    addedAt: addedAt || now,
    attributes,
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
    subtotal: +accounting.toFixed(quantity * finalPrice, 3),
    title: chosenProduct.title,
    updatedAt: now,
    variantId: chosenVariant.variantId,
    variantTitle: chosenVariant.title,
    workflow: { status: "new", workflow: ["coreOrderWorkflow/created", "coreItemWorkflow/removedFromInventoryAvailableToSell"] }
  };

  let cartItem;
  if (cart && cart.items.length) {
    cartItem = cart.items.find((cItem) => cItem.productId === newItem.productId);
  }
  for (const func of context.getFunctionsOfType("mutateNewOrderItemBeforeCreate")) {
    await func(context, { chosenProduct, chosenVariant, item: newItem, cartItem }); // eslint-disable-line no-await-in-loop
  }

  return newItem;
}
