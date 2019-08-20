/* eslint-disable node/no-deprecated-api */
/* TODO: revisit `url.parse` throughout Reaction */
import url from "url";

/**
 * @name primaryShopId
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Returns the shop ID for the domain in ROOT_URL
 *   or, if none found, the ID of the shop where shopType
 *   is "primary".
 * @param {Object} collections Map of MongoDB collections
 * @returns {String|null} Shop ID or `null`
 */
export default async function primaryShopId(collections) {
  const { Shops } = collections;

  const { ROOT_URL } = process.env;
  if (typeof ROOT_URL !== "string") return null;

  const domain = url.parse(ROOT_URL).hostname;
  const options = { projection: { _id: 1 } };

  let shop = await Shops.findOne({ domains: domain }, options);

  if (!shop) {
    shop = await Shops.findOne({ shopType: "primary" }, options);
    if (!shop) return null;
  }

  return shop._id;
}
