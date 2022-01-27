import ShopsData from "../json-data/Shops.json";

const now = new Date();

/**
 * @summary load a single Shop
 * @param {object} context - The application context
 * @returns {Promise<Boolean>} true if success
 */
export default async function loadShops(context) {
  const { simpleSchemas: { Shop: ShopSchema }, collections: { Shops } } = context;
  const [oneShop] = ShopsData;
  oneShop.createdAt = now;
  oneShop.updatedAt = now;
  ShopSchema.validate(oneShop);
  await Shops.insertOne(oneShop);
}

