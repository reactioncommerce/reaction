import { getXformedCurrenciesByShop } from "@reactioncommerce/reaction-graphql-xforms/currency";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import administrators from "./administrators";
import groups from "./groups";
import roles from "./roles";
import tags from "./tags";

export default {
  _id: (node) => encodeShopOpaqueId(node._id),
  administrators,
  currencies: (shop) => getXformedCurrenciesByShop(shop),
  currency: (shop) => getXformedCurrenciesByShop(shop).find((currency) => currency.code === (shop.currency || "USD")),
  groups,
  roles,
  tags
};
