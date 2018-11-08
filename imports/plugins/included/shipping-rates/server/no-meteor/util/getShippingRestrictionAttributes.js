import ReactionError from "@reactioncommerce/reaction-error";
import { findCatalogProductsAndVariants, pick, tagsByIds, mergeProductAndVariants } from "./helpers";

/**
 * @name getShippingRestrictionAttributes
 * @summary Get shipping attributes for a fulfillment group that will be used to
 * determine any applicable shipping restrictions.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} cartWithSummary - the users cart with its summary
 * @param {Object} cartWithSummary.summary - The cart summary
 * @param {Object} fulfillmentGroup - a fulfillment group for a shopping cart
 * @param {Object} fulfillmentGroup.address - the shipping address
 * @param {Array} fulfillmentGroup.items - the items in the cart
 * @returns {Object|null} shipping restriction attributes for the provided fulfillment group
 */
export default async function getShippingRestrictionAttributes(context, cartWithSummary, fulfillmentGroup) {
  const { collections, getFunctionsOfType } = context;
  const { address: destination, items: orderItems } = fulfillmentGroup;
  const address = pick(destination, ["address1", "address2", "city", "country", "postal", "region"]);
  const { summary } = cartWithSummary;
  const products = [];

  // Products in the Catalog collection are the source of truth, therefore use them
  // as the source of data instead of what is coming from the client.
  const catalogProductsAndVariants = await findCatalogProductsAndVariants(collections, orderItems);
  const allProductsTags = await tagsByIds(collections, catalogProductsAndVariants);

  for (const orderLineItem of orderItems) {
    const productAndVariants = catalogProductsAndVariants.find((catProduct) => catProduct.product.productId === orderLineItem.productId);

    if (!productAndVariants) {
      throw new ReactionError("not-found", "Catalog product not found");
    }

    const flattenProduct = mergeProductAndVariants(productAndVariants);

    // Fetch product tags
    allProductsTags.find((tag) => {
      if (tag.productId === productAndVariants.product.productId) {
        flattenProduct.tags = tag.tags;
      }
      return null;
    });

    // Fetch custom attributes
    getFunctionsOfType("addShippingRestrictionCustomAttributes").forEach((customAttributesFunc) => {
      customAttributesFunc(flattenProduct, productAndVariants);
    });

    products.push(flattenProduct);
  }

  return {
    address,
    discountTotal: summary.discountTotal.amount,
    items: products,
    itemTotal: summary.itemTotal.amount,
    total: summary.total.amount
  };
}
