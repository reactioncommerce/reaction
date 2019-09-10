import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { FileRecord } from "@reactioncommerce/file-collections";

/**
 * @name tag/setTagHeroMedia
 * @method
 * @memberof Tag/Methods
 * @summary Insert a new hero media record and attach it to a tag.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} SetTagHeroMediaPayload
 */
export default async function setTagHeroMedia(context, input) {
  const { appEvents, collections, userHasPermission } = context;
  const { Media, MediaRecords, Tags } = collections;
  const { shopId, tagId, fileRecord } = input;

  // Check for owner or admin permissions from the user before allowing the mutation
  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  let heroMediaUrl = null;

  if (fileRecord) {
    const doc = {
      ...fileRecord,
      _id: Random.id(),
      metadata: {
        ...fileRecord.metadata,
        workflow: "published"
      }
    };

    const { insertedId } = await MediaRecords.insertOne(doc);

    // Because we don't have access to the URL of the file, we have to
    // do our best to get the URL as it will be once the file is finished being processed.
    heroMediaUrl = `${FileRecord.downloadEndpointPrefix}/${Media.name}/${insertedId}/large/${fileRecord.original.name}`;
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
