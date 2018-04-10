import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import createdBy from "./createdBy";
import shop from "./shop";

export default {
  _id: (node) => encodeGroupOpaqueId(node._id),
  createdBy,
  shop
};
