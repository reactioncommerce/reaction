import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import heroMediaUrl from "./heroMediaUrl";
import subTags from "./subTags";

export default {
  _id: (tag) => encodeTagOpaqueId(tag._id),
  heroMediaUrl,
  subTagIds: (tag) => (tag.relatedTagIds || []).map(encodeTagOpaqueId),
  subTags
};
