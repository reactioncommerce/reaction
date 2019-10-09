import _ from "lodash";
import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import copyMedia from "../utils/copyMedia.js";

const inputSchema = new SimpleSchema({
  "shopId": String,
  "variantIds": Array,
  "variantIds.$": {
    type: String
  }
});

/**
 *
 * @method cloneProductVariants
 * @summary clones a product variant into a new variant
 * @description the method copies variants, but will also create and clone
   * child variants (options)
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.shopId - shop these variants belong to
 * @param {String} input.variantIds - an array of decoded variant IDs to clone
 * @return {Array} list with cloned variant Ids
 */
export default async function cloneProductVariants(context, input) {
  inputSchema.validate(input);
  const { collections, userHasPermission } = context;
  const { Products } = collections;
  const { shopId, variantIds } = input;

  if (!userHasPermission(["createProduct", "product/admin", "product/clone"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Check to make sure all variants are on the same shop
  const count = await Products.find({ _id: { $in: variantIds }, type: "variant", shopId }).count();
  if (count !== variantIds.length) throw new ReactionError("not-found", "One or more variants do not exist");

  const newVariants = await Promise.all(variantIds.map(async (variantId) => {
    const existingVariant = await Products.findOne({ _id: variantId });
    const productId = existingVariant.ancestors[0];

    const existingVariants = await Products.find({
      $or: [
        {
          _id: variantId
        },
        {
          ancestors: {
            $in: [variantId]
          },
          isDeleted: false
        }
      ],
      type: "variant"
    }).toArray();

    // If there are no variants, return empty array
    if (existingVariants.length === 0) return null;

    const variantNewId = Random.id();

    // make sure that top level variant will be cloned first
    const sortedVariants = _.sortBy(existingVariants, (sortedVariant) => sortedVariant.ancestors.length);

    await Promise.all(sortedVariants.map(async (sortedVariant) => {
      const originalVariantId = sortedVariant._id;
      let type = "child";
      const clonedVariantObject = {};
      if (variantId === sortedVariant._id) {
        type = "parent";
        Object.assign(clonedVariantObject, sortedVariant, {
          _id: variantNewId,
          title: `${sortedVariant.title} - copy`,
          optionTitle: `${sortedVariant.optionTitle} - copy`
        });
      } else {
        const parentIndex = sortedVariant.ancestors.indexOf(variantId);
        const ancestorsClone = sortedVariant.ancestors.slice(0);
        // if variantId exists in ancestors, we override it by new _id
        if (parentIndex >= 0) ancestorsClone.splice(parentIndex, 1, variantNewId);
        Object.assign(clonedVariantObject, existingVariant, {
          _id: Random.id(),
          ancestors: ancestorsClone,
          title: `${sortedVariant.title}`,
          optionTitle: `${sortedVariant.optionTitle}`,
          height: `${sortedVariant.height}`,
          width: `${sortedVariant.width}`,
          weight: `${sortedVariant.weight}`,
          length: `${sortedVariant.length}`
        });
      }
      delete clonedVariantObject.updatedAt;
      delete clonedVariantObject.createdAt;

      // Apply custom transformations from plugins.
      for (const customFunc of context.getFunctionsOfType("mutateNewVariantBeforeCreate")) {
        // Functions of type "mutateNewVariantBeforeCreate" are expected to mutate the provided variant.
        // We need to run each of these functions in a series, rather than in parallel, because
        // we are mutating the same object on each pass.
        // eslint-disable-next-line no-await-in-loop
        await customFunc(clonedVariantObject, { context, isOption: clonedVariantObject.ancestors.length > 1 });
      }

      // copy media to new variant
      await copyMedia(context, productId, originalVariantId, clonedVariantObject._id);

      const { insertedId: clonedVariantId } = await Products.insertOne(clonedVariantObject, { validate: false });

      if (!clonedVariantId) {
        Logger.error(`cloneProductVariants: cloning of ${variantId} failed`);
        throw new ReactionError("server-error", `Cloning of ${variantId} failed`);
      }

      Logger.debug(`cloneProductVariants: created ${type === "child" ? "sub child " : ""}clone: ${clonedVariantObject._id} from ${variantId}`);
    }));

    const newFinalProduct = await Products.findOne({ _id: variantNewId });

    return newFinalProduct;
  }));

  return newVariants;
}
