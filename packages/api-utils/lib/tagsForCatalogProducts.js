/**
 * @name tagsForCatalogProducts
 * @summary Finds all tags associated with the provided array of catalog products.
 * @param {Mongo.Collection} Tags - The Tags Mongo.Collection instance
 * @param {Array} catalogProducts - An array of products in the Catalog collection.
 * @returns {Array} - An array of tag names and corresponding product IDs.
 */
export default async function tagsForCatalogProducts(Tags, catalogProducts) {
  const tagIds = catalogProducts.reduce((list, item) => {
    if (item.product.tagIds) {
      list.push(...item.product.tagIds);
    }
    return list;
  }, []);

  if (tagIds.length === 0) return [];

  const tags = await Tags.find({ _id: { $in: tagIds } }).toArray();

  return catalogProducts.reduce((list, item) => {
    if (item.product.tagIds) {
      list.push({
        productId: item.product.productId,
        tags: item.product.tagIds.map((id) => {
          const foundTag = tags.find((tag) => tag._id === id);
          return foundTag ? foundTag.name : null;
        })
      });
    }
    return list;
  }, []);
}
