import { registerImportableCollection } from "@reactioncommerce/reaction-import-connectors";
import Random from "@reactioncommerce/random";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import Logger from "@reactioncommerce/logger";
import rawCollections from "/imports/collections/rawCollections";
import { ProductsImpColl, TagsImpColl } from "../../lib/importableCollections";

ProductsImpColl.rawCollection = rawCollections.Products;

const tagsCollectionCallback = () => {
  const shopId = Reaction.getPrimaryShopId();
  return { shopId };
};

const tagsRowCallback = (item, options) => {
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

const tagsAfterInsertCallback = (items) => {
  items.forEach(async (item) => {
    if (item.parentTag) {
      const parentTag = await rawCollections.Tags.findOne({ name: item.parentTag });
      const currentTag = await rawCollections.Tags.findOne({ name: item.name });
      if (parentTag) {
        rawCollections.Tags.update({ _id: parentTag._id }, {
          $push: {
            relatedTagIds: currentTag._id
          }
        });
        rawCollections.Tags.update({ _id: currentTag._id }, {
          $set: {
            isTopLevel: false
          }
        });
      }
    }
  });
};

const ServerTagsImpColl = Object.assign(TagsImpColl, {
  rawCollection: rawCollections.Tags,
  rowCallback: tagsRowCallback,
  afterInsertCallback: tagsAfterInsertCallback,
  collectionCallback: tagsCollectionCallback
});

registerImportableCollection(ProductsImpColl);
registerImportableCollection(ServerTagsImpColl);
