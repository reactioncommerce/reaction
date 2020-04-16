import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const addTag = importAsString("./addTag.graphql");
const productsByTagId = importAsString("./productsByTagId.graphql");
const removeTag = importAsString("./removeTag.graphql");
const setTagHeroMedia = importAsString("./setTagHeroMedia.graphql");
const tag = importAsString("./tag.graphql");
const tags = importAsString("./tags.graphql");
const updateTag = importAsString("./updateTag.graphql");

export default [
  addTag,
  productsByTagId,
  removeTag,
  setTagHeroMedia,
  tag,
  tags,
  updateTag
];
