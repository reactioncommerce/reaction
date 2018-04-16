import { isEmpty } from "lodash";

/**
 * @name primaryImage
 * @method
 * @summary Returns information about the primary image for a product, in the GraphQL ImageInfo format
 * @param {Object} product - CatalogProduct response from parent resolver
 * @return {Promise<Object[]>} Promise that resolves with an image info object
 */
export default async function primaryImage(product) {
  const { media } = product;
  if (isEmpty(media)) return null;

  const { metadata, large, medium, original, small, thumbnail } = media;

  return {
    priority: metadata && metadata.priority,
    toGrid: metadata && metadata.toGrid,
    URLs: {
      large,
      medium,
      original,
      small,
      thumbnail
    }
  };
}
