import { encodeCatalogItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogItem";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import product from "./product";

export default {
  _id: (item) => encodeCatalogItemOpaqueId(item._id),
  product,
  shop: resolveShopFromShopId
};
