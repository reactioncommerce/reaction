import shops from "./shops.js";

export default {
  shopById: (context, _id) => context.dataLoaders.Shops.load(_id),
  shopBySlug: (context, slug) => context.collections.Shops.findOne({ slug }),
  shops,
  primaryShop: (context) => context.collections.Shops.findOne({ shopType: "primary" }),
  async primaryShopId(context) {
    const shop = await context.collections.Shops.findOne({
      shopType: "primary"
    }, {
      projection: {
        _id: 1
      }
    });
    return shop ? shop._id : null;
  }
};
