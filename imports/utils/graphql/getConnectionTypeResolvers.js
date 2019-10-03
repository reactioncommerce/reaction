/**
 * @name getConnectionTypeResolvers
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Makes resolvers for connection and edge types, based on the parent resolver returning an object
 *   that has a `nodes` property that is an array of the items.
 * @param {String} name name of connection / edge
 * @returns {Object} An object with `${name}Connection` and `${name}Edge` properties, to be included in
 *   the resolvers object.
 */
export default function getConnectionTypeResolvers(name) {
  return {
    [`${name}Connection`]: {
      edges: ({ nodes }) => nodes
    },
    [`${name}Edge`]: {
      cursor: (item) => item._id,
      node: (item) => item
    }
  };
}
