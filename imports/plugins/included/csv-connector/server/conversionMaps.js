import { registerConversionMap } from "../lib/common/conversionMaps";
import { TagsConvMap } from "../lib/conversionMaps";
import Random from "@reactioncommerce/random";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";

const { Tags } = rawCollections;

const tagsPreSaveCallback = () => {
  const shopId = Reaction.getPrimaryShopId();
  return { shopId };
};

const tagsConversionCallback = (item, options) => {
  const res = {};
  if (!item._id) {
    res._id = Random.id();
    res.isDeleted = false;
    res.createdAt = new Date();
    res.updatedAt = new Date();
    if (!item.shopId) {
      res.shopId = options.shopId;
    }
    if (item.isTopLevel === undefined) {
      res.isTopLevel = true;
    }
    if (item.isVisible === undefined) {
      res.isVisible = true;
    }
    if (!item.slug) {
      res.slug = Reaction.getSlug(item.name);
    } else {
      res.slug = Reaction.getSlug(item.name);
    }
  } else if (item.slug) {
    res.slug = Reaction.getSlug(item.slug);
  }
  return res;
};

const tagsPostSaveCallback = async (item) => {
  if (item.parentTagSlug) {
    const parentTag = await Tags.findOne({ slug: item.parentTagSlug });
    const currentTag = await Tags.findOne({ name: item.name });
    if (parentTag) {
      Tags.update({ _id: parentTag._id }, {
        $push: {
          relatedTagIds: currentTag._id
        }
      });
      Tags.update({ _id: currentTag._id }, {
        $set: {
          isTopLevel: false
        }
      });
    } else {
      throw Error(`Parent tag ${item.parentTagSlug} not found.`);
    }
  }
};

const ServerTagsConvMap = Object.assign(TagsConvMap, {
  rawCollection: Tags,
  preSaveCallback: tagsPreSaveCallback,
  conversionCallback: tagsConversionCallback,
  postSaveCallback: tagsPostSaveCallback
});

registerConversionMap("Tags", ServerTagsConvMap);
