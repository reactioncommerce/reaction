import ReactionError from "@reactioncommerce/reaction-error";
import { tagsByIds, mergeProductAndVariants } from "./helpers";

/**
 * @name extendCommonOrder
 * @summary Get shipping attributes for a fulfillment group that will be used to
 * determine any applicable shipping restrictions.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} commonOrder - details about the purchase a user wants to make.
 * @param {Array} fulfillmentGroup.items - the items in the cart
 * @returns {Object|null} shipping restriction attributes for the provided fulfillment group
 */
export default async function extendCommonOrder(context, commonOrder) {
  const { collections, getFunctionsOfType, queries } = context;
  const { items: orderItems } = commonOrder;
  const products = [];

  // Products in the Catalog collection are the source of truth, therefore use them
  // as the source of data instead of what is coming from the client.
  const catalogProductsAndVariants = await queries.findCatalogProductsAndVariants(context, orderItems);
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
    ...commonOrder,
    items: products
  };
}
