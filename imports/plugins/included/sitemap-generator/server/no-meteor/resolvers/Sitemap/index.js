import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

export default {
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
