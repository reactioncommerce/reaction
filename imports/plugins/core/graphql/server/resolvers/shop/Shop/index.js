import { getXformedCurrenciesByShop } from "@reactioncommerce/reaction-graphql-xforms/currency";
import administrators from "./administrators";
import groups from "./groups";
import roles from "./roles";

export default {
  administrators,
  currencies: (shop) => getXformedCurrenciesByShop(shop),
  currency: (shop) => getXformedCurrenciesByShop(shop).find((currency) => currency.code === (shop.currency || "USD")),
  groups,
  roles
};
