/**
 *
 * @method
 * @summary
 * @memberof Catalog
 * @param  {Object} productPositions - TODO
 * @return {Object}
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
