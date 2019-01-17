import appEvents from "/imports/node-app/core/util/appEvents";
import ReactionError from "@reactioncommerce/reaction-error";
import { Media } from "/imports/plugins/core/files/server";
import { FileRecord } from "@reactioncommerce/file-collections";
import { MediaRecords } from "/lib/collections";

/**
 * @name tag/setTagHeroMedia
 * @method
 * @memberof Tag/Methods
 * @summary Insert a new hero media record and attach it to a tag.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @return {Promise<Object>} SetTagHeroMediaPayload
 */
export default async function setTagHeroMedia(context, input) {
  const { collections, userHasPermission } = context;
  const { Tags } = collections;
  const { shopId, tagId, fileRecord } = input;

  // Check for owner or admin permissions from the user before allowing the mutation
  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  let heroMediaUrl = null;

  if (fileRecord) {
    const doc = {
      ...fileRecord,
      metadata: {
        ...fileRecord.metadata,
        workflow: "published"
      }
    };

    const mediaRecordId = await MediaRecords.insert(doc);

    // Because we don't have access to the URL of the file, we have to take
    // do our best to get he URL as it will be once the file is finished being processed.
    heroMediaUrl = `${FileRecord.downloadEndpointPrefix}/${Media.name}/${mediaRecordId}/large/${fileRecord.original.name}`;
  }

  const { result } = await Tags.updateOne({
    _id: tagId
  }, {
    $set: {
      heroMediaUrl
    }
  });

  if (result.n === 0) {
    throw new ReactionError("not-found", `Hero media couldn't be updated on tag ${tagId}`);
  }

  const tag = await Tags.findOne({ _id: tagId, shopId });

  appEvents.emit("afterSetTagHeroMedia", tag);

  return tag;
}
