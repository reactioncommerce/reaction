import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  "productIds": Array,
  "productIds.$": {
    type: String
  },
  "shopId": String
});

/**
 *
 * @method archiveProducts
 * @summary archives a product
 * @description the method archives products, but will also archive
   * child variants and options
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.productIds - an array of decoded product IDs to archive
 * @param {String} input.shopId - shop these products belong to
 * @return {Array} array with archived products
 */
export default async function archiveProducts(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission, userId } = context;
  const { MediaRecords, Products } = collections;
  const { productIds, shopId } = input;

  if (!userHasPermission(["createProduct", "product/admin", "product/archive"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Check to make sure all products are on the same shop
  const count = await Products.find({ _id: { $in: productIds }, shopId }).count();
  if (count !== productIds.length) throw new ReactionError("not-found", "One or more products do not exist");

  // Find all products that aren't deleted, and all their variants variants
  const productsWithVariants = await Products.find({
    // Don't "archive" products that are already marked deleted.
    isDeleted: {
      $ne: true
    },
    $or: [
      {
        _id: {
          $in: productIds
        }
      },
      {
        ancestors: {
          $in: productIds
        }
      }
    ]
  }).toArray();

  // Get ID's of all products to archive
  const productIdsToArchive = productsWithVariants.map((product) => product._id);


  const archivedProducts = await Promise.all(productIdsToArchive.map(async (productId) => {
    const { value: archivedProduct } = await Products.findOneAndUpdate(
      {
        _id: productId
      },
      {
        $set: {
          isDeleted: true
        }
      }, {
        returnOriginal: false
      }
    );

    if (archivedProduct.type === "variant") {
      appEvents.emit("afterVariantSoftDelete", {
        variant: {
          ...archivedProduct
        },
        deletedBy: userId
      });
    } else {
      appEvents.emit("afterProductSoftDelete", {
        product: {
          ...archivedProduct
        },
        deletedBy: userId
      });
    }
    return archivedProduct;
  }));

  if (archivedProducts && archivedProducts.length) {
    // Flag associated MediaRecords as deleted.
    await MediaRecords.updateMany(
      {
        $or: [
          {
            "metadata.productId": {
              $in: productIdsToArchive
            }
          },
          {
            "metadata.variantId": {
              $in: productIdsToArchive
            }
          }
        ]
      },
      {
        $set: {
          "metadata.isDeleted": true,
          "metadata.workflow": "archived"
        }
      }
    );
  }

  // Return only originally supplied product(s),
  // not variants and options also archived
  return archivedProducts.filter((archivedProduct) => productIds.includes(archivedProduct._id));
}
