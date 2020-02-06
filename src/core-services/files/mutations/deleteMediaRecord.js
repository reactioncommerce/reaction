import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Delete a MediaRecord
 * @param {Object} context App context
 * @param {Object} input Input data
 * @returns {Object} Deleted MediaRecord
 */
export default async function deleteMediaRecord(context, input) {
  const {
    appEvents,
    collections: { Media, MediaRecords },
    userId
  } = context;
  const { mediaRecordId, shopId } = input;

  await context.validatePermissions(`reaction:legacy:mediaRecords:${mediaRecordId}`, "delete:media", { shopId });

  const mediaRecord = await MediaRecords.findOne({
    "_id": mediaRecordId,
    "metadata.shopId": shopId
  });
  if (!mediaRecord) throw new ReactionError("not-found", `Media record with ID ${mediaRecordId} not found`);

  // We use `Media` instead of `MediaRecords` because `Media`
  // is bound to the file data and will ensure that the file
  // data also gets removed in addition to the file record.
  const result = await Media.remove(mediaRecordId);

  if (result !== 1) throw new ReactionError("server-error", `Failed to delete media record with ID ${mediaRecordId}`);

  appEvents.emit("afterMediaRemove", { removedBy: userId, mediaRecord });

  return mediaRecord;
}
