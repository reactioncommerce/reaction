import { encodeTagsOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import subTags from "./subTags";

export default {
  _id: (tag) => encodeTagsOpaqueId(tag._id),
  subTagIds: (tag) => (tag.relatedTagIds || []).map(encodeTagsOpaqueId),
  subTags
};
