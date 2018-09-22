import { getXformedCurrencyByCode, getXformedCurrenciesByShop } from "@reactioncommerce/reaction-graphql-xforms/currency";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import administrators from "./administrators";
import groups from "./groups";
import roles from "./roles";
import tags from "./tags";

export default {
  _id: (node) => encodeShopOpaqueId(node._id),
  administrators,
  currencies: (shop) => getXformedCurrenciesByShop(shop),
  currency: (shop) => getXformedCurrencyByCode(shop.currency),
  groups,
  roles,
  tags
};
