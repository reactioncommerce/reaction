import url from "url";

export default {
  shopById: (context, _id) => context.collections.Shops.findOne({ _id }),
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
