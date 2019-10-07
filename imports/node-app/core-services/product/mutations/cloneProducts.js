/* eslint-disable no-await-in-loop */
import _ from "lodash";
import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import copyMedia from "../utils/copyMedia.js";
import createHandle from "../utils/createHandle.js";
import createTitle from "../utils/createTitle.js";

const inputSchema = new SimpleSchema({
  "productIds": Array,
  "productIds.$": {
    type: String
  },
  "shopId": String
});

/**
 *
 * @method cloneProducts
 * @summary clones a product into a new product
 * @description the method copies products, but will also create and clone
   * child variants and options
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.productIds - an array of decoded product IDs to clone
 * @param {String} input.shopId - shop these products belong to
 * @return {Array} list with cloned product Ids
 */
export default async function cloneProducts(context, input) {
  inputSchema.validate(input);
  const { collections, userHasPermission } = context;
  const { Products } = collections;
  const { productIds, shopId } = input;

  if (!userHasPermission(["createProduct", "product/admin", "product/clone"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Check to make sure all variants are on the same shop
  const count = await Products.find({ _id: { $in: productIds }, type: "simple", shopId }).count();
  if (count !== productIds.length) throw new ReactionError("not-found", "One or more products do not exist");

  const idPairs = []; // idPairs: { oldId, newId }

  // eslint-disable-next-line require-jsdoc
  function getIds(id) {
    return idPairs.filter(
      function (pair) {
        return pair.oldId === this.id;
      },
      {
        id
      }
    );
  }

  // eslint-disable-next-line require-jsdoc
  function setId(ids) {
    return idPairs.push(ids);
  }

  // eslint-disable-next-line require-jsdoc
  function buildAncestors(ancestors) {
    const newAncestors = [];
    ancestors.map((oldId) => {
      const pair = getIds(oldId);
      newAncestors.push(pair[0].newId);
      return newAncestors;
    });
    return newAncestors;
  }


  const newProducts = await Promise.all(productIds.map(async (productId) => {
    const product = await Products.findOne({ _id: productId });

    // cloning product
    const productNewId = Random.id();
    setId({
      oldId: product._id,
      newId: productNewId
    });

    const newProduct = Object.assign({}, product, {
      _id: productNewId
    });
    delete newProduct.updatedAt;
    delete newProduct.createdAt;
    delete newProduct.publishedAt;
    delete newProduct.positions;
    delete newProduct.handle;
    newProduct.isVisible = false;
    if (newProduct.title) {
      newProduct.title = await createTitle(context, newProduct.title, newProduct._id);
      newProduct.handle = await createHandle(context, getSlug(newProduct.title), newProduct._id);
    }

    const { insertedId: productInsertedId } = await Products.insertOne(newProduct, { validate: false });

    if (!productInsertedId) {
      Logger.error(`cloneProducts: cloning of product ${product._id} failed`);
      throw new ReactionError("server-error", `Cloning of product ${product._id} failed`);
    }

    // cloning variants
    const existingVariants = await Products.find({
      ancestors: {
        $in: [product._id]
      },
      type: "variant"
    }).toArray();

    // make sure that top level variant will be cloned first
    const sortedVariants = _.sortBy(existingVariants, (sortedVariant) => sortedVariant.ancestors.length);
    await Promise.all(sortedVariants.map(async (variant) => {
      const variantNewId = Random.id();
      setId({
        oldId: variant._id,
        newId: variantNewId
      });

      const ancestors = buildAncestors(variant.ancestors);
      const newVariant = Object.assign({}, variant, {
        _id: variantNewId,
        ancestors
      });
      delete newVariant.updatedAt;
      delete newVariant.createdAt;

      const { insertedId: variantInsertedId } = await Products.insertOne(newVariant, { validate: false });
      if (!variantInsertedId) {
        Logger.error(`cloneProducts: cloning of variant ${variant._id} failed`);
        throw new ReactionError("server-error", `Cloning of variant ${variant._id} failed`);
      }

      await copyMedia(context, productNewId, variant._id, variantNewId);
    }));

    const newFinalProduct = await Products.findOne({ _id: productNewId });

    return newFinalProduct;
  }));

  return newProducts;
}
