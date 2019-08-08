export default function createDataLoaders(context, dataloaderFactory, convertToDataloaderResult) {
  return {
    Shops: dataloaderFactory(async (ids) => {
      const results = await context.collections.Shops.find({ _id: { $in: ids } }).toArray();
      return convertToDataloaderResult(ids, results, "_id");
    })
  };
}
