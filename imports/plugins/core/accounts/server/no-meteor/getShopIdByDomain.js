import url from "url";

export default async function getShopIdByDomain(collections) {
  const { Shops } = collections;

  const { ROOT_URL } = process.env;
  if (typeof ROOT_URL !== "string") return null;

  const domain = url.parse(ROOT_URL).hostname;

  const shop = await Shops.findOne({
    domains: domain
  }, {
    fields: {
      _id: 1
    }
  });

  return (shop && shop._id) || null;
}
