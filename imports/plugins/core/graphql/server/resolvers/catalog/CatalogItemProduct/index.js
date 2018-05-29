import { encodeCatalogItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogItem";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import positions from "./positions";
import product from "./product";

export default {
  _id: (item) => encodeCatalogItemOpaqueId(item._id),
  positions,
  product,
  shop: resolveShopFromShopId
};
