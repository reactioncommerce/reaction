import _ from "lodash";
import fetch from "node-fetch";
import { FileRecord } from "@reactioncommerce/file-collections";
import Random from "@reactioncommerce/random";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";
import { registerConversionMap } from "../../lib/common/conversionMaps";
import { ProductsConvMap } from "../../lib/conversionMaps";

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

  if (res.template === undefined) {
    res.template = "productDetailSimple";
  }

  if (item.parentTitle || item.parentId) {
    res.type = "variant";
  } else {
    res.type = "simple";
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

const postImportInsertCallback = async (item, options) => {
  const { shopId } = options;
  const {
    _id,
    images,
    optionTitle,
    parentId,
    parentTitle,
    tagIds,
    tagSlugs,
    type
  } = item;
  const ancestors = [];
  const errors = [];
  const currentProductUpdate = {};
  const stores = ["image", "large", "medium", "small", "thumbnail"];

  if (type === "variant") {
    let parentFilter = { title: parentTitle };
    if (parentId) {
      parentFilter = { _id };
    }
    currentProductUpdate.type = "variant";
    const ancestorDoc = await Products.findOne(parentFilter);
    if (ancestorDoc) {
      // add the direct ancestor
      ancestors.push(ancestorDoc._id);

      if (ancestorDoc.ancestors && ancestorDoc.ancestors.length === 1 && ancestorDoc.ancestors[0]) {
        // if its ancestor is a variant and the ancestor of the variant already exists
        // then it is known that the product is an option
        // so add the ancestor of the parent variant
        ancestors.unshift(ancestorDoc.ancestors[0]);
      } else if (type === "variant") {
        // if current product is actually a variant, add its parent to its children
        const childAncestors = [ancestorDoc._id, _id];
        await Products.update({ ancestors: _id }, { $set: { ancestors: childAncestors } });
      }

      if (ancestors.length === 2 && !optionTitle) {
        errors.push("Option title is required.");
      }

      currentProductUpdate.ancestors = ancestors;
    } else {
      errors.push(`Parent ${parentId || parentTitle} not found.`);
    }
  }

  if (type === "simple" && (tagIds || tagSlugs)) {
    let existingTags;
    if (tagIds && tagIds.length > 0 && tagIds[0]) {
      existingTags = await Tags.find({ _id: { $in: tagIds } }, { _id: 1 }).toArray();
    } else if (tagSlugs.length > 0 && tagSlugs[0]) {
      existingTags = await Tags.find({ slug: { $in: tagSlugs } }, { _id: 1 }).toArray();
    }
    const hashtags = existingTags.map((tag) => tag._id);
    currentProductUpdate.hashtags = hashtags;
  }

  // ancestors.length > 0 instead of type === "variant" to be specific
  // that the ancestor ids are required here
  if (ancestors.length > 0 && (images && images.length > 0 && images[0])) {
    try {
      await Promise.all(images.map(async (imgURL, index) => {
        const result = await fetch(imgURL);
        const mimetype = result.headers.get("content-type");
        let name = "upload.png";
        if (mimetype !== "image/png") {
          name = "upload.jpg";
        }
        const imgFileDoc = {
          original: {
            name,
            type: mimetype,
            updatedAt: new Date()
          }
        };
        const fileRecord = new FileRecord(imgFileDoc);
        fileRecord.metadata = {
          productId: ancestors[0],
          variantId: _id,
          shopId,
          priority: index,
          toGrid: 1,
          workflow: "published"
        };
        await Media.insert(fileRecord, { raw: true });
        await Promise.all(stores.map(async (storeName) => {
          const store = Media.getStore(storeName);
          const writeStream = await store.createWriteStream(fileRecord);
          result.body.pipe(writeStream);
        }));
      }));
    } catch (error) {
      errors.push("Images not saved");
    }
  }

  if (!_.isEmpty(currentProductUpdate)) {
    await Products.updateOne({ _id }, { $set: currentProductUpdate });
  }

  // The price update of parents should be here so that the ancestors of current product are already set at this point
  if (ancestors.length > 0) {
    await Promise.all(ancestors.map(async (ancestorId) => {
      const childVariants = await Products.find({ ancestors: ancestorId }, { price: 1 }).toArray();
      const childVariantsPrices = childVariants.filter((variant) => typeof variant.price === "number").map((variant) => variant.price);
      const minPrice = _.min(childVariantsPrices);
      const maxPrice = _.max(childVariantsPrices);
      let range = `${minPrice} - ${maxPrice}`;
      if (minPrice === maxPrice) {
        range = minPrice;
      }
      const price = {
        min: minPrice,
        max: maxPrice,
        range
      };
      await Products.update({ _id: ancestorId }, { $set: { price } });
    }));
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
