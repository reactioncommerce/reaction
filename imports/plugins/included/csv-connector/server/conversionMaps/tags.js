import { registerConversionMap } from "../../lib/common/conversionMaps";
import { TagsConvMap } from "../../lib/conversionMaps";
import Random from "@reactioncommerce/random";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";

const { Tags } = rawCollections;

const preImportInsertCallback = () => {
  const shopId = Reaction.getShopId();
  return { shopId };
};

const importConversionInsertCallback = (item, options) => {
  const res = {};
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
    res.slug = Reaction.getSlug(item.slug);
  }
  return res;
};

const postImportInsertCallback = async (item) => {
  const errors = [];
  if (item.parentTagId) {
    const parentTag = await Tags.findOne({ slug: item.parentTagId });
    const currentTag = await Tags.findOne({ name: item.name });
    if (parentTag) {
      Tags.update({ _id: parentTag._id }, {
        $addToSet: {
          relatedTagIds: [currentTag._id]
        }
      });
      Tags.update({ _id: currentTag._id }, {
        $set: {
          isTopLevel: false
        }
      });
    } else {
      errors.push(`Parent tag ${item.parentTagId} not found.`);
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
      errors.push(`Parent tag ${item.parentTagSlug} not found.`);
    }
  }
  console.log(errors);
  return errors;
};

const importConversionUpdateCallback = (item) => {
  const res = {};
  res.updatedAt = new Date();
  if (item.slug) {
    res.slug = Reaction.getSlug(item.slug);
  }
  return res;
};

const postImportUpdateCallback = async (item) => {
  // item._id is assumed to be valid at this point
  const errors = [];
  if ("parentTagId" in item || "parentTagSlug" in item) {
    await Tags.updateOne({ relatedTagIds: item._id }, { $pull: { relatedTagsIds: item._id } });

    if (item.parentTagId || item.parentTagSlug) {
      let parentTagFilter = { slug: item.parentTagSlug };
      if (item.parentTagId) {
        parentTagFilter = { _id: item.parentTagId };
      }
      const newParentTag = await Tags.findOne(parentTagFilter);
      if (newParentTag) {
        await Tags.updateOne({ _id: newParentTag._id }, { $addToSet: { relatedTagIds: [item._id] } });
        await Tags.updateOne({ _id: item._id }, { $set: { isTopLevel: false } });
      } else {
        errors.push(`Parent tag ${item.parentTagId || item.parentTagSlug} not found.`);
      }
    } else {
      // if parentTagId or parentTagSlug are empty strings, then it means the tag is to be a top level tag
      await Tags.updateOne({ _id: item._id }, { $set: { isTopLevel: true } });
    }
  }
  return errors;
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
  preImportInsertCallback,
  importConversionInsertCallback,
  postImportInsertCallback,
  importConversionUpdateCallback,
  postImportUpdateCallback,
  exportConversionCallback
});

registerConversionMap("Tags", ServerTagsConvMap);

export default ServerTagsConvMap;
