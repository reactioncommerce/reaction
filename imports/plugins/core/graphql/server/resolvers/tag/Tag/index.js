import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import subTags from "./subTags";

export default {
  _id: (tag) => encodeTagOpaqueId(tag._id),
  subTagIds: (tag) => (tag.relatedTagIds || []).map(encodeTagOpaqueId),
  subTags
};
