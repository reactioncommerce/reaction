import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Media } from "/lib/collections";
import { Reaction } from "/server/api";

export function updateMediaMetadata(mediaId, metadata) {
  check(mediaId, String);

  Media.update({ _id: mediaId }, {
    $set: {
      metadata
    }
  });
}

export function updateMediaPosition(mediaIdArray) {
  check(mediaIdArray, [String]);

  mediaIdArray.forEach((mediaId, index) => {
    Media.update(mediaId, {
      $set: {
        "metadata.priority": index
      }
    });
  });
}

export function removeMedia(mediaId) {
  check(mediaId, String);

  return Media.remove({ _id: mediaId });
}

Meteor.methods({
  "media/updateMetadata": updateMediaMetadata,
  "media/updatePositions": updateMediaPosition,
  "media/remove": removeMedia
});
