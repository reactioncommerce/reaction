import ReactionError from "@reactioncommerce/reaction-error";
import tagsForCatalogProducts from "@reactioncommerce/api-utils/tagsForCatalogProducts.js";

const productExcludeProps = [
  "customAttributes",
  "media",
  "metafields",
  "parcel",
  "primaryImage",
  "socialMetadata",
  "variants"
];

const variantExcludeProps = [
  "customAttributes",
  "media",
  "parcel",
  "primaryImage"
];

/**
 * @name mergeProductAndVariants
 * @summary Merges a product and its variants
 * @param {Object} productAndVariants - The product and its variants
 * @returns {Object} - The merged product and variants
 */
function mergeProductAndVariants(productAndVariants) {
  const { product, parentVariant, variant } = productAndVariants;

  const mergedVariant = {};

  // Copy product props first so that variant props with the same
  // name will override these. They are more specific.
  Object.keys(product).forEach((prop) => {
    if (!productExcludeProps.includes(prop)) {
      mergedVariant[prop] = product[prop];
    }
  });

  // Copy parent variant props next so that variant props with
  // the same name will override these. They are more specific.
  if (parentVariant) {
    Object.keys(parentVariant).forEach((prop) => {
      if (!variantExcludeProps.includes(prop)) {
        mergedVariant[prop] = parentVariant[prop];
      }
    });
  }

  // Copy variant props last
  Object.keys(variant).forEach((prop) => {
    if (!variantExcludeProps.includes(prop)) {
      mergedVariant[prop] = variant[prop];
    }
  });

  return mergedVariant;
}

/**
 * @name extendCommonOrder
 * @summary Add extra properties to all CommonOrder items, which will be used to
 *   determine any applicable surcharges.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} commonOrder - details about the purchase a user wants to make.
 * @returns {Object|null} The CommonOrder, with each item in `.items` extended.
 */
export default async function extendCommonOrder(context, commonOrder) {
  const { collections: { Tags }, getFunctionsOfType, queries } = context;
  const { items: orderItems } = commonOrder;
  const extendedOrderItems = [];

  // Products in the Catalog collection are the source of truth, therefore use them
  // as the source of data instead of what is coming from the client.
  const catalogProductsAndVariants = await queries.findCatalogProductsAndVariants(context, orderItems);
  const allProductsTags = await tagsForCatalogProducts(Tags, catalogProductsAndVariants);

  for (const orderLineItem of orderItems) {
    const productAndVariants = catalogProductsAndVariants.find((catProduct) => catProduct.product.productId === orderLineItem.productId);

    if (!productAndVariants) {
      throw new ReactionError("not-found", "Catalog product not found");
    }

    const extendedOrderItem = {
      ...orderLineItem,
      ...mergeProductAndVariants(productAndVariants)
    };

    // Fetch product tags
    const tagInfo = allProductsTags.find((info) => info.productId === extendedOrderItem.productId);
    if (tagInfo) {
      extendedOrderItem.tags = tagInfo.tags;
    }

    // Fetch custom attributes
    // We need to run each of these functions in a series, rather than in parallel, because
    // we are mutating the same object on each pass. It is recommended to disable `no-await-in-loop`
    // eslint rules when the output of one iteration might be used as input in another iteration, such as this case here.
    // See https://eslint.org/docs/rules/no-await-in-loop#when-not-to-use-it
    for (const customAttributesFunc of getFunctionsOfType("addSurchargeCustomAttributes")) {
      await customAttributesFunc(extendedOrderItem, productAndVariants); // eslint-disable-line
    }

    extendedOrderItems.push(extendedOrderItem);
  }

  return {
    ...commonOrder,
    items: extendedOrderItems
  };
}
