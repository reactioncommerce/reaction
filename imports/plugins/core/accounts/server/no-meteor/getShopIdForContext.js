import { get } from "lodash";
import getShopIdByDomain from "./getShopIdByDomain";

export default async function getShopIdForContext(context) {
  const { user } = context;

  let shopId;

  if (user) {
    shopId = get(user, "profile.preferences.reaction.activeShopId");
  }

  // if still not found, look up the shop by domain
  if (!shopId) {
    shopId = await getShopIdByDomain(context);
  }

  // if (shopId) {
  //   // TODO: set user preference such that a user returning to the Primary Shop
  //   // will already be in their preferred shop

  //   Reaction.setUserPreferences("reaction", "activeShopId", shopId);
  // }

  return shopId || null;
}
