import graphqlFields from "graphql-fields";
import _ from "lodash";

/**
 * @summary Determine whether a GraphQL request includes a particular field.
 * @param {String} field The field to check. Can be an object path.
 * @param {Object} info The fourth argument that is passed to every GraphQL resolver
 * @returns {Boolean} True if they want `field` returned
 */
export default function wasFieldRequested(field, info) {
  return _.has(graphqlFields(info), field);
}
