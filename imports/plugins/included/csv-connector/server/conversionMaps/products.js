import { registerConversionMap } from "../../lib/common/conversionMaps";
import { ProductsConvMap } from "../../lib/conversionMaps";
import Random from "@reactioncommerce/random";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";

const { Products } = rawCollections;

const productsPreSaveCallback = () => {
  const shopId = Reaction.getPrimaryShopId();
  return { shopId };
};

const productsConversionCallback = (item, shouldUpdate, options) => {
  const res = {};
  if (!shouldUpdate) {
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

const productsPostSaveCallback = async (item) => {
  if (item.parentTagSlug) {
    const parentTag = await Products.findOne({ slug: item.parentTagSlug });
    const currentTag = await Products.findOne({ name: item.name });
    if (parentTag) {
      Products.update({ _id: parentTag._id }, {
        $push: {
          relatedTagIds: currentTag._id
        }
      });
      Products.update({ _id: currentTag._id }, {
        $set: {
          isTopLevel: false
        }
      });
    } else {
      throw Error(`Parent tag ${item.parentTagSlug} not found.`);
    }
  }
};

const ServerProductsConvMap = Object.assign(ProductsConvMap, {
  rawCollection: Products,
  preSaveCallback: productsPreSaveCallback,
  conversionCallback: productsConversionCallback,
  postSaveCallback: productsPostSaveCallback
});

registerConversionMap("Products", ServerProductsConvMap);

export default ServerProductsConvMap;
