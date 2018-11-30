import ReactionError from "@reactioncommerce/reaction-error";
import { findCatalogProductsAndVariants, pick, tagsByIds, mergeProductAndVariants } from "./helpers";

/**
 * @name getShippingRestrictionAttributes
 * @summary Get shipping attributes for a fulfillment group that will be used to
 * determine any applicable shipping restrictions.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} totals - The totals object with discounts, item, and group totals
 * @param {Object} fulfillmentGroup - a fulfillment group for a shopping cart
 * @param {Object} fulfillmentGroup.address - the shipping address
 * @param {Array} fulfillmentGroup.items - the items in the cart
 * @returns {Object|null} shipping restriction attributes for the provided fulfillment group
 */
export default async function getShippingRestrictionAttributes(context, totals, fulfillmentGroup) {
  const { collections, getFunctionsOfType } = context;
  const { address: destination, items: orderItems } = fulfillmentGroup;
  const address = pick(destination, ["address1", "address2", "city", "country", "postal", "region"]);
  const products = [];

  // Products in the Catalog collection are the source of truth, therefore use them
  // as the source of data instead of what is coming from the client.
  const catalogProductsAndVariants = await findCatalogProductsAndVariants(collections, orderItems);
  const allProductsTags = await tagsByIds(collections, catalogProductsAndVariants);

  for (const orderLineItem of orderItems) {
    const productAndVariants = catalogProductsAndVariants.find((catProduct) => catProduct.product.productId === orderLineItem.productId || orderLineItem.productConfiguration.productId);

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
    // We need to run each of these functions in a series, rather than in parallel, because
    // we are mutating the same object on each pass. It is recommended to disable `no-await-in-loop`
    // eslint rules when the output of one iteration might be used as input in another iteration, such as this case here.
    // See https://eslint.org/docs/rules/no-await-in-loop#when-not-to-use-it
    for (const customAttributesFunc of getFunctionsOfType("addShippingRestrictionCustomAttributes")) {
      await customAttributesFunc(flattenProduct, productAndVariants); // eslint-disable-line
    }

    products.push(flattenProduct);
  }

  return {
    address,
    discountTotal: totals.groupDiscountTotal.amount,
    items: products,
    itemTotal: totals.groupItemTotal.amount,
    total: totals.groupTotal.amount
  };
}
