import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeCatalogItemOpaqueId } from "../../xforms/id.js";

export default {
  _id: (item) => encodeCatalogItemOpaqueId(item._id),
  shop: resolveShopFromShopId
};
