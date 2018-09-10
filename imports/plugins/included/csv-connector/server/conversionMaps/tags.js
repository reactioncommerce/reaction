import { registerConversionMap } from "../../lib/common/conversionMaps";
import { TagsConvMap } from "../../lib/conversionMaps";
import Random from "@reactioncommerce/random";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";

const { Tags } = rawCollections;

const preImportCallback = () => {
  const shopId = Reaction.getPrimaryShopId();
  return { shopId };
};

const importConversionCallback = (item, options) => {
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

const postImportCallback = async (item) => {
  if (item.parentTagId) {
    const parentTag = await Tags.findOne({ slug: item.parentTagId });
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
      throw Error(`Parent tag ${item.parentTagId} not found.`);
    }
  } else if (item.parentTagSlug) {
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

const exportConversionCallback = async (doc, fields) => {
  const { _id } = doc;
  const row = await Promise.all(fields.map(async (field) => {
    if (field === "parentTagSlug" || field === "parentTagId") {
      const parentTag = await Tags.findOne({ relatedTagIds: _id });
      if (parentTag) {
        if (field === "parentTagSlug") {
          return parentTag.slug;
        }
        return parentTag._id;
      }
      return "";
    }
    return doc[field];
  }));
  return row;
};


const ServerTagsConvMap = Object.assign(TagsConvMap, {
  rawCollection: Tags,
  preImportCallback,
  importConversionCallback,
  postImportCallback,
  exportConversionCallback
});

registerConversionMap("Tags", ServerTagsConvMap);

export default ServerTagsConvMap;
