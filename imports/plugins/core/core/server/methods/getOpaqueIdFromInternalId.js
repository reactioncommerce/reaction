import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { encodeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/id";

/**
 * @method getOpaqueIdFromInternalId
 * @memberof Core/Methods
 * @summary Converts an internal ID to a Node ID for use in GraphQL. This is a temporary bridge
 *   between older Meteor publications that publish internal IDs to clients and newer GraphQL
 *   queries where the client only ever sees the globally unique and opaque ID.
 * @param {String} namespace - The namespace for making the ID unique
 * @param {String} id - The ID
 * @return {String} - The opaque ID
 */
export default function getOpaqueIdFromInternalId(namespace, id) {
  check(namespace, String);
  check(id, String);

  return encodeOpaqueId(namespaces[namespace], id);
}
