import { get } from "lodash";
import getShopIdByDomain from "./getShopIdByDomain";

export default async function getShopIdForContext(context) {
  const { collections, user } = context;

  let shopId;

  if (user) {
    shopId = get(user, "profile.preferences.reaction.activeShopId");
  }

  // if still not found, look up the shop by domain
  if (!shopId) {
    shopId = await getShopIdByDomain(collections);
  }

  return shopId || null;
}
