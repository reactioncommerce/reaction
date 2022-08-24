import { encodeNavigationTreeOpaqueId } from "../../xforms/id.js";
import defaultNavigationTree from "./defaultNavigationTree.js";

export default {
  defaultNavigationTreeId: (shop) => encodeNavigationTreeOpaqueId(shop.defaultNavigationTreeId),
  defaultNavigationTree
};
