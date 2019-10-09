import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Update priority metadata for a MediaRecord
 * @param {Object} context App context
 * @param {Object} input Input data
 * @returns {Object} Updated MediaRecord
 */
export default async function updateMediaRecordPriority(context, input) {
  const {
    appEvents,
    collections: { MediaRecords },
    userHasPermission,
    userId
  } = context;
  const { mediaRecordId, priority, shopId } = input;

  if (!userHasPermission(["media/update"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const { value: updatedMediaRecord } = await MediaRecords.findOneAndUpdate(
    {
      "_id": mediaRecordId,
      "metadata.shopId": shopId
    },
    {
      $set: {
        "metadata.priority": priority
      }
    },
    {
      returnOriginal: false
    }
  );

  if (!updatedMediaRecord) {
    throw new ReactionError("server-error", "Unable to set media record priority");
  }

  appEvents.emit("afterMediaUpdate", { updatedBy: userId, mediaRecord: updatedMediaRecord });

  return updatedMediaRecord;
}
