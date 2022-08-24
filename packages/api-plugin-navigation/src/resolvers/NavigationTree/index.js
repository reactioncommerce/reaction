import { encodeNavigationTreeOpaqueId, encodeShopOpaqueId } from "../../xforms/id.js";
import xformNavigationTreeItem from "../../xforms/xformNavigationTreeItem.js";

export default {
  _id: (node) => encodeNavigationTreeOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId),
  items: (node, args, context) => (node.items && node.items.length &&
    node.items.map((item) => xformNavigationTreeItem(context, node.language, item))) || [],
  draftItems: (node, args, context) => (node.draftItems && node.draftItems.length &&
    node.draftItems.map((item) => xformNavigationTreeItem(context, node.language, item))) || []
};
