/**
 * @summary if no data in cache, repopulate
 * @param {Object} db - The db instance
 * @return {Promise<{Object}>} - The shop timezone object after pushing data to cache
 */
async function populateCache(db) {
  const Shops = db.collection("Shops");
  const shopTzObject = {};
  const shops = await Shops.find({}).toArray();
  for (const shop of shops) {
    const { _id: shopId } = shop;
    shopTzObject[shopId] = shop.timezone;
  }
  return shopTzObject;
}

/**
 * @summary get the current time in the shops timezone
 * @param {Object} db - The db instance
 * @return {Promise<{Object}>} - Object of shops and their current time in their timezone
 */
export default async function getCurrentShopTime(db) {
  const shopTzData = await populateCache(db);
  const shopNow = {};
  for (const shop of Object.keys(shopTzData)) {
    const now = new Date().toLocaleString("en-US", { timeZone: shopTzData[shop] });
    const nowDate = new Date(now);
    shopNow[shop] = nowDate;
  }
  return shopNow;
}
