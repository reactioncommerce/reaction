export default {
  shopById: (context, _id) => context.dataLoaders.Shops.load(_id),
  shopBySlug: (context, slug) => context.collections.Shops.findOne({ slug }),
  primaryShop: (context) => context.collections.Shops.findOne({ shopType: "primary" }),
  primaryShopId(context) {
    const shop = context.collections.Shops.findOne({ shopType: "primary" });
    return shop ? shop._id : null;
  }
};
