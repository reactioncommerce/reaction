/**
 * @summary Returns the URL prefix for a shop
 * @param {Object} collections Map of MongoDB collections
 * @param {String} shopId The shop ID
 * @returns {String} Prefix that begins with "/"
 */
export default async function getShopPrefix(collections, shopId) {
  const { Packages, Shops } = collections;

  const shop = await Shops.findOne({
    _id: shopId
  }, {
    projection: {
      shopType: 1,
      slug: 1
    }
  });

  let primaryShopId;
  if (shop.shopType === "primary") {
    primaryShopId = shop._id;
  } else {
    const primaryShop = await Shops.findOne({
      shopType: "primary"
    }, {
      projection: {
        _id: 1
      }
    });
    primaryShopId = primaryShop && primaryShop._id;
  }

  if (!primaryShopId) return `/${shop.slug}`;

  const marketplace = await Packages.findOne({
    name: "reaction-marketplace",
    shopId: primaryShopId
  });
  if (marketplace && marketplace.settings && marketplace.settings.public && typeof marketplace.settings.public.shopPrefix === "string") {
    return `${marketplace.settings.public.shopPrefix}/${shop.slug}`;
  }

  return `/${shop.slug}`;
}
