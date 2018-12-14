import { encodeNavigationItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationItem";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

export default {
  _id: (node) => encodeNavigationItemOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
