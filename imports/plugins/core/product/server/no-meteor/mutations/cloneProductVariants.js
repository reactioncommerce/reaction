import SimpleSchema from "simpl-schema";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import executeBulkOperation from "../utils/executeBulkOperation";

const inputSchema = new SimpleSchema({
  productId: String,
  variantId: String
});

/**
 *
 * @method cloneProductVariants
 * @summary clones a product variant into a new variant
 * @description the method copies variants, but will also create and clone
   * child variants (options)
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.productId - the product ID the variant belongs to
 * @param {String} input.variantIds - the IDs of the variant to clone
 * @return {Array} list with cloned variants _ids
 */
export default async function cloneProductVariants(context, input) {
  inputSchema.validate(input);
  const { productId, variantIds } = input;
  const { collections } = context;
}











//   "products/cloneProductVariant"(productId, variantId) {
//     check(productId, String);
//     check(variantId, String);

console.log(" ------------------- here");


//     // Check first if Variant exists and then if user has the right to clone it
//     const variant = Products.findOne({ _id: variantId });
//     if (!variant) {
//       throw new ReactionError("not-found", "Variant not found");
//     }

//     const authUserId = Reaction.getUserId();

//     if (!Reaction.hasPermission(["createProduct", "product/admin", "product/clone"], authUserId, variant.shopId)) {
//       throw new ReactionError("access-denied", "Access Denied");
//     }

//     // Verify that this variant and any ancestors are not deleted.
//     // Child variants cannot be added if a parent product is marked as `{ isDeleted: true }`
//     if (ReactionProduct.isAncestorDeleted(variant, true)) {
//       throw new ReactionError("server-error", "Unable to create product variant");
//     }

//     const variants = Products.find({
//       $or: [
//         {
//           _id: variantId
//         },
//         {
//           ancestors: {
//             $in: [variantId]
//           },
//           isDeleted: false
//         }
//       ],
//       type: "variant"
//     }).fetch();

//     // exit if we're trying to clone a ghost
//     if (variants.length === 0) return [];

//     const context = Promise.await(getGraphQLContextInMeteorMethod(authUserId));

//     const variantNewId = Random.id(); // for the parent variant
//     // we need to make sure that top level variant will be cloned first, his
//     // descendants later.
//     // we could use this way in future: http://stackoverflow.com/questions/
//     // 9040161/mongo-order-by-length-of-array, by now following are allowed
//     // @link https://lodash.com/docs#sortBy
//     const sortedVariants = _.sortBy(variants, (doc) => doc.ancestors.length);

//     return sortedVariants.map((sortedVariant) => {
//       const oldId = sortedVariant._id;
//       let type = "child";
//       const clone = {};
//       if (variantId === sortedVariant._id) {
//         type = "parent";
//         Object.assign(clone, sortedVariant, {
//           _id: variantNewId,
//           title: `${sortedVariant.title} - copy`,
//           optionTitle: `${sortedVariant.optionTitle} - copy`
//         });
//       } else {
//         const parentIndex = sortedVariant.ancestors.indexOf(variantId);
//         const ancestorsClone = sortedVariant.ancestors.slice(0);
//         // if variantId exists in ancestors, we override it by new _id
//         if (parentIndex >= 0) ancestorsClone.splice(parentIndex, 1, variantNewId);
//         Object.assign(clone, variant, {
//           _id: Random.id(),
//           ancestors: ancestorsClone,
//           title: `${sortedVariant.title}`,
//           optionTitle: `${sortedVariant.optionTitle}`,
//           height: `${sortedVariant.height}`,
//           width: `${sortedVariant.width}`,
//           weight: `${sortedVariant.weight}`,
//           length: `${sortedVariant.length}`
//         });
//       }
//       delete clone.updatedAt;
//       delete clone.createdAt;

//       // Apply custom transformations from plugins.
//       for (const customFunc of context.getFunctionsOfType("mutateNewVariantBeforeCreate")) {
//         // Functions of type "mutateNewVariantBeforeCreate" are expected to mutate the provided variant.
//         Promise.await(customFunc(clone, { context, isOption: clone.ancestors.length > 1 }));
//       }

//       copyMedia(productId, oldId, clone._id);

//       let newId;
//       try {
//         newId = Products.insert(clone, { validate: false });
//         Logger.debug(`products/cloneVariant: created ${type === "child" ? "sub child " : ""}clone: ${clone._id} from ${variantId}`);
//       } catch (error) {
//         Logger.error(`products/cloneVariant: cloning of ${variantId} was failed: ${error}`);
//         throw error;
//       }

//       return newId;
//     });
//   },
