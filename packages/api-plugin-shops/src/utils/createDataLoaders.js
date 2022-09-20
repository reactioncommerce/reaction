/**
  * @param {Object} context An object with request-specific state
  * @param {Function} dataloaderFactory dataloader factory
  * @param {Function} convertToDataloaderResult function to convert data to array
  * @returns {Array} converted result
  */
export default function createDataLoaders(context, dataloaderFactory, convertToDataloaderResult) {
  return {
    Shops: dataloaderFactory(async (ids) => {
      const results = await context.collections.Shops.find({ _id: { $in: ids } }).toArray();
      return convertToDataloaderResult(ids, results, "_id");
    })
  };
}
