import { encodeNavigationTreeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationTree";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import xformNavigationTreeItem from "../../xforms/xformNavigationTreeItem";

export default {
  _id: (node) => encodeNavigationTreeOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId),
  items: async (node, args, context) => {
    return node.items && node.items.length && node.items.map(async (item) => await xformNavigationTreeItem(context, item))
  },
  draftItems: async (node, args, context) => {
    return node.draftItems && node.draftItems.length && node.draftItems.map(async (item) => await xformNavigationTreeItem(context, item))
  }
};
