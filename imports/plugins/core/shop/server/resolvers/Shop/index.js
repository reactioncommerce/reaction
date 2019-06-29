import { getXformedCurrencyByCode, getXformedCurrenciesByShop } from "@reactioncommerce/reaction-graphql-xforms/currency";
import { encodeNavigationTreeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationTree";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import brandAssets from "./brandAssets";
import defaultNavigationTree from "./defaultNavigationTree";
import tags from "./tags";

export default {
  _id: (node) => encodeShopOpaqueId(node._id),
  brandAssets,
  currencies: (shop) => getXformedCurrenciesByShop(shop),
  currency: (shop) => getXformedCurrencyByCode(shop.currency),
  defaultNavigationTreeId: (shop) => encodeNavigationTreeOpaqueId(shop.defaultNavigationTreeId),
  defaultNavigationTree,
  tags
};
