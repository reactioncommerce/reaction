import { connectionFromArray } from "graphql-relay";

/**
 * @name xformArrayToConnection
 * @method
 * @memberof GraphQL/Transforms
 * @param {Object} connectionArgs GraphQL connection arguments
 * @param {Array|Promise<Array>} results The array of results
 * @returns {Object} A connection shaped object of the results array
 */
export async function xformArrayToConnection(connectionArgs, results) {
  // results may be either an array or a Promise that will resolve with an array
  const resolvedResults = await results;

  const connection = connectionFromArray(resolvedResults, connectionArgs);

  // XXX An optimization would be to do this map only if the client
  // actually asked for the `nodes` array.
  connection.nodes = connection.edges.map(({ node }) => node);

  connection.totalCount = resolvedResults.length;

  return connection;
}
