import { encodeCatalogItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogItem";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";

export default {
  _id: (item) => encodeCatalogItemOpaqueId(item._id),
  shop: resolveShopFromShopId
};
