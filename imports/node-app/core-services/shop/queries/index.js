/* eslint-disable node/no-deprecated-api */
/* TODO: revisit `url.parse` throughout Reaction */
import url from "url";

export default {
  shopById: (context, _id) => context.dataLoaders.Shops.load(_id),
  shopBySlug: (context, slug) => context.collections.Shops.findOne({ slug }),
  primaryShop: async (context) => {
    const { collections, rootUrl } = context;
    const { Shops } = collections;
    const domain = url.parse(rootUrl).hostname;
    let shop = await Shops.findOne({ domains: domain });
    if (!shop) {
      shop = await Shops.findOne({ shopType: "primary" });
    }
    return shop;
  }
};
