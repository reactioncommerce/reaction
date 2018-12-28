import url from "url";

export default async function getShopIdByDomain(context) {
  const { collections, rootUrl } = context;
  const { Shops } = collections;

  if (typeof rootUrl !== "string") return null;

  const domain = url.parse(rootUrl).hostname;

  const shop = await Shops.findOne({
    domains: domain
  }, {
    fields: {
      _id: 1
    }
  });

  return (shop && shop._id) || null;
}
