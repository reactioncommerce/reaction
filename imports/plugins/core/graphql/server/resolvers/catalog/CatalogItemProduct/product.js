import { xformProductMedia } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";

/**
 * @name "CatalogItemProduct.product"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Returns the product for a catalog item
 * @param {Object} item - CatalogItem response from parent resolver
 * @return {Object} Adjusted product object
 */
export default function product(item) {
  const { media } = item;
  const primaryImage = (media || [])
    .sort((a, b) => a.metadata.priority - b.metadata.priority)
    .find(({ metadata = {} }) => metadata.toGrid === 1);

  return {
    ...item,
    isTaxable: !!item.taxable,
    media: media.map(xformProductMedia),
    primaryImage: xformProductMedia(primaryImage),
    tagIds: item.hashtags,
    slug: item.handle,
    socialMetadata: [
      { service: "twitter", message: item.twitterMsg },
      { service: "facebook", message: item.facebookMsg },
      { service: "googleplus", message: item.googleplusMsg },
      { service: "pinterest", message: item.pinterestMsg }
    ],
    updatedAt: item.updatedAt || item.createdAt
  };
}
