import { registerImportableCollection } from "@reactioncommerce/reaction-import-connectors";
import Random from "@reactioncommerce/random";
import Reaction from "/imports/plugins/core/core/server/Reaction";
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
      res.slug = item.name;
    }
  }
  return res;
};

const ServerTagsImpColl = Object.assign(TagsImpColl, {
  rawCollection: rawCollections.Tags,
  rowCallback: tagsRowCallback,
  collectionCallback: tagsCollectionCallback
});

registerImportableCollection(ProductsImpColl);
registerImportableCollection(ServerTagsImpColl);
