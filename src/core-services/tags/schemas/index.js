import { createRequire } from "module";

const require = createRequire(import.meta.url);

const addTag = require("./addTag.graphql");
const productsByTagId = require("./productsByTagId.graphql");
const removeTag = require("./removeTag.graphql");
const setTagHeroMedia = require("./setTagHeroMedia.graphql");
const tag = require("./tag.graphql");
const tags = require("./tags.graphql");
const updateTag = require("./updateTag.graphql");

export default [
  addTag,
  productsByTagId,
  removeTag,
  setTagHeroMedia,
  tag,
  tags,
  updateTag
];
