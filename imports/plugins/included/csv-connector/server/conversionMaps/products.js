import _ from "lodash";
import { registerConversionMap } from "../../lib/common/conversionMaps";
import { ProductsConvMap } from "../../lib/conversionMaps";
import Random from "@reactioncommerce/random";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";

const { Media, Products, Tags } = rawCollections;

const preImportInsertCallback = () => {
  const shopId = Reaction.getShopId();
  return { shopId };
};

const importConversionInsertCallback = (item, options) => {
  const errors = [];
  const res = {};

  res._id = Random.id();
  res.isDeleted = false;
  res.createdAt = new Date();
  res.updatedAt = new Date();
  res.type = "simple";
  res.isLowQuantity = false;
  res.isDeleted = false;
  res.workflow = { status: "new" };
  res.ancestors = [];
  if (!item.shopId) {
    res.shopId = options.shopId;
  }
  if (item.taxable === undefined) {
    res.taxable = false;
  }
  if (item.isVisible === undefined) {
    res.isVisible = true;
  }
  if (item.inventoryManagement === undefined) {
    res.inventoryManagement = true;
  }
  if (item.inventoryPolicy === undefined) {
    res.inventoryPolicy = true;
  }
  if (!(item.lowInventoryWarningThreshold > 0)) {
    res.lowInventoryWarningThreshold = 0;
  }

  if (!item.slug) {
    res.handle = Reaction.getSlug(item.title);
  } else {
    res.handle = Reaction.getSlug(item.slug);
  }

  if (item.metafields && item.metafields.length > 0 && item.metafields[0]) {
    const metafields = [];
    item.metafields.forEach((metafield) => {
      const metafieldSplit = metafield.split(" : ");
      if (metafieldSplit.length === 2) {
        metafields.push({ key: metafieldSplit[0], value: metafieldSplit[1] });
      } else {
        errors.push(`Metafield ${metafield} is invalid.`);
      }
    });
    res.metafields = metafields;
  }

  return { item: res, errors };
};

const postImportInsertCallback = async (item) => {
  const errors = [];
  const update = {};

  if (item.parentTitle || item.parentId) {
    let parentFilter = { title: item.parentTitle };
    if (item.parentId) {
      parentFilter = { _id: item._id };
    }
    const ancestors = [];
    update.type = "variant";
    const ancestorDoc = await Products.findOne(parentFilter);
    if (ancestorDoc) {
      ancestors.push(ancestorDoc._id);
      if (ancestorDoc.ancestors && ancestorDoc.ancestors.length === 1) {
        ancestors.unshift(ancestorDoc.ancestors[0]);
      }
      update.ancestors = ancestors;
      if (ancestors.length === 2 && !item.optionTitle) {
        errors.push("Option title is required.");
      }
    } else {
      errors.push(`Parent ${item.parentId || item.parentTitle} not found.`);
    }
  } else if (item.tagIds || item.tagSlugs) {
    console.log("ITEMSLIGS", item.tagSlugs);
    let existingTags;
    if (item.tagIds && item.tagIds.length > 0 && item.tagIds[0]) {
      existingTags = await Tags.find({ slug: { $in: item.tagSlugs } }, { _id: 1 }).toArray();
      // existingTags = await Tags.find({ _id: { $in: item.tagIds } }, { _id: 1 }).toArray();
    } else {
      existingTags = await Tags.find({ slug: { $in: item.tagSlugs } }, { _id: 1 }).toArray();
    }
    console.log(existingTags);
    const hashtags = existingTags.map((tag) => tag._id);
    console.log("HASHHS", hashtags);
    update.hashtags = hashtags;
  }

  if (!_.isEmpty(update)) {
    await Products.updateOne({ _id: item._id }, { $set: update });
  }

  return errors;
};

const exportConversionCallback = async (doc, fields) => {
  const { _id, ancestors } = doc;
  const row = await Promise.all(fields.map(async (field) => {
    if (["supportedFulfillmentTypes", "tagIds"].includes(field)) {
      if (doc[field]) {
        return doc[field].join(" || ");
      }
      return "";
    } else if (field === "parentId") {
      let parentId;
      if (ancestors.length === 1) {
        parentId = ancestors[0]; // eslint-disable-line prefer-destructuring
      } else if (ancestors.length === 2) {
        const ancestorDoc = await Products.findOne({ _id: { $in: ancestors }, type: "variant" });
        parentId = ancestorDoc._id;
      }
      return parentId || "";
    } else if (field === "metafields") {
      const { metafields } = doc;
      if (!metafields || (metafields.length === 1 && !metafields[0].key)) {
        return "";
      }
      const metafieldArr = metafields.map((metafield) => `${metafield.key} : ${metafield.value}`);
      return metafieldArr.join(" || ");
    } else if (field === "price") {
      if (typeof doc.price === "number") {
        return doc.price;
      }
      return "";
    } else if (field === "images") {
      const mediaArray = await Media.find(
        {
          "metadata.variantId": _id,
          "metadata.toGrid": 1,
          "metadata.workflow": { $nin: ["archived", "unpublished"] }
        },
        {
          sort: { "metadata.priority": 1, "uploadedAt": 1 }
        }
      );
      const mediaURLs = mediaArray.map((fileRecord) => `/assets/files/Media/${fileRecord.document._id}/large/${fileRecord.document.original.name}`);
      return mediaURLs.join(" || ");
    } else if (field === "tagSlugs" && doc.hashtags && doc.hashtags.length > 0) {
      const tags = await Tags.find({ _id: { $in: doc.hashtags } }, { slug: 1 }).toArray();
      const slugs = tags.map((tag) => tag.slug);
      return slugs.join(" || ");
    }
    return doc[field];
  }));

  return row;
};

const ServerProductsConvMap = Object.assign(ProductsConvMap, {
  rawCollection: Products,
  preImportInsertCallback,
  postImportInsertCallback,
  importConversionInsertCallback,
  exportConversionCallback
});

registerConversionMap("Products", ServerProductsConvMap);

export default ServerProductsConvMap;
