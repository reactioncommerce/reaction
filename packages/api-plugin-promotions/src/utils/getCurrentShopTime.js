import NodeCache from "node-cache";

const timeZoneCache = new NodeCache({ stdTTL: 3600 }); // one hour

/**
 * @summary retrieve shop timezones from cache
 * @param {Object} context - The application context
 * @return {Promise<{Object}>} - The shop timezone object
 */
async function getShopTzDataFromCache(context) {
  const timeZoneObject = timeZoneCache.get("timeZoneObject");
  if (timeZoneObject) {
    return JSON.parse(timeZoneObject);
  }
  const shopTzObject = await populateCache(context);
  return shopTzObject;
}

/**
 * @summary if no data in cache, repopulate
 * @param {Object} context - The application context
 * @return {Promise<{Object}>} - The shop timezone object after pushing data to cache
 */
async function populateCache(context) {
  const { collections: { Shops } } = context;
  const shopTzObject = {};
  const shops = await Shops.find({}).toArray();
  for (const shop of shops) {
    const { _id: shopId } = shop;
    shopTzObject[shopId] = shop.timezone;
  }
  timeZoneCache.set("timeZoneObject", JSON.stringify(shopTzObject));
  return shopTzObject;
}


/**
 * @summary get the current time in the shops timezone
 * @param {Object} context - The application context
 * @return {Promise<{Object}>} - Object of shops and their current time in their timezone
 */
export default async function getCurrentShopTime(context) {
  const shopTzData = await getShopTzDataFromCache(context);
  const shopNow = {};
  for (const shop of Object.keys(shopTzData)) {
    const now = new Date().toLocaleString("en-US", { timeZone: shopTzData[shop] });
    const nowDate = new Date(now);
    shopNow[shop] = nowDate;
  }
  return shopNow;
}
