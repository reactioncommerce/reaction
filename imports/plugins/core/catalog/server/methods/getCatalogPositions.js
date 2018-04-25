/**
 *
 * @method getCatalogPositions
 * @summary returns the products postions as an array of CatalogPosition objects.
 * @memberof Catalog
 * @param  {Object} productPositions - product positions by tag.
 * @return {Array} array of CatalogPosition objects
 */
export default async function getCatalogPositions(productPositions) {
  return Object.keys(productPositions).map((tagId) => {
    const info = productPositions[tagId];
    return {
      displayWeight: info.weight,
      isPinned: !!info.pinned,
      position: info.position || 1,
      tagId,
      updatedAt: info.updatedAt
    };
  });
}
