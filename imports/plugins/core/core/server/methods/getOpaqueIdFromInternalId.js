import { check } from "meteor/check";
import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { encodeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/id";

/**
 * @method getOpaqueIdFromInternalId
 * @memberof Core/Methods
 * @summary Converts an internal ID to a Node ID for use in GraphQL. This is a temporary bridge
 *   between older Meteor publications that publish internal IDs to clients and newer GraphQL
 *   queries where the client only ever sees the globally unique and opaque ID.
 * @param {Object[]} input - Array of objects with id and namespace props
 * @returns {String[]} - Array of opaque IDs
 */
export default function getOpaqueIdFromInternalId(input) {
  check(input, Array);

  return input.map(({ id, namespace }) => encodeOpaqueId(namespaces[namespace], id));
}
