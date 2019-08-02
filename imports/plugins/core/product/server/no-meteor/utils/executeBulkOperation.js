import Logger from "@reactioncommerce/logger";

const logCtx = { name: "core/product", file: " bulkRemoveTagsFromProducts" };

/**
 *
 * @param {Object[]} collection Mongo collection
 * @param {Object[]} operations bulk operations to perform
 * @param {Int} totalProduct total number of products to operate on
 * @return {Object} Object with information of results of bulk the operations
 */
export default async function (collection, operations, totalProduct) {
  let response;
  try {
    Logger.trace({ ...logCtx, operations }, "Running bulk operation");
    response = await collection.bulkWrite(operations, { ordered: false });
  } catch (error) {
    Logger.error({ ...logCtx, error }, "One or more of the bulk update failed");
    response = error; // error object has details about failed & successful operations
  }

  const { nMatched, nModified, writeErrors } = response;
  const notFoundCount = totalProduct - nMatched;

  return {
    foundCount: nMatched,
    notFoundCount,
    updatedCount: nModified,
    writeErrors
  };
}
