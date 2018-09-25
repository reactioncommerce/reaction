import { isPlainObject } from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

export function encodeNavItemMetadata(metadata) {
  if (isPlainObject(metadata) === false) {
    throw new ReactionError("invalid-metadata", "Supplied metadata is not an object");
  }

  try {
    const encodedMetadata = JSON.stringify(metadata);
    return encodedMetadata;
  } catch(error) {
    throw new ReactionError("invalid-metadata", "Supplied metadata could not be stringified");
  }
}

export function decodeNavItemMetadata(metadata) {
  try {
    const decodedMetadata = JSON.parase(metadata);
    return decodedMetadata;
  } catch(error) {
    throw new ReactionError("invalid-metadata", "Supplied metadata could not be parsed");
  }
}
