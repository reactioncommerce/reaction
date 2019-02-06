import { getXformedCurrencyByCode, getXformedCurrenciesByShop } from "@reactioncommerce/reaction-graphql-xforms/currency";
import { encodeNavigationTreeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationTree";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import administrators from "./administrators";
import brandAssets from "./brandAssets";
import defaultNavigationTree from "./defaultNavigationTree";
import groups from "./groups";
import roles from "./roles";
import tags from "./tags";

export default {
  _id: (node) => encodeShopOpaqueId(node._id),
  administrators,
  brandAssets,
  currencies: (shop) => getXformedCurrenciesByShop(shop),
  currency: (shop) => getXformedCurrencyByCode(shop.currency),
  defaultNavigationTreeId: (shop) => encodeNavigationTreeOpaqueId(shop.defaultNavigationTreeId),
  defaultNavigationTree,
  groups,
  roles,
  tags
};
