import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Media, Revisions } from "/lib/collections";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api";

export async function mediaInsert(fileRecord) {
  check(fileRecord, Object);
  if (RevisionApi.isRevisionControlEnabled() && fileRecord.metadata.workflow !== "published") {
    if (fileRecord.metadata.productId) {
      const revisionMetadata = Object.assign({}, fileRecord.metadata);
      revisionMetadata.workflow = "published";
      Revisions.insert({
        documentId: fileRecord._id,
        documentData: revisionMetadata,
        documentType: "image",
        parentDocument: fileRecord.metadata.productId,
        changeType: "insert",
        workflow: {
          status: "revision/update"
        }
      });
      fileRecord.metadata.workflow = "unpublished";
    } else {
      fileRecord.metadata.workflow = "published";
    }
  }

  return await Media.insert(fileRecord);
}

Meteor.methods({ "media/insert": mediaInsert });
