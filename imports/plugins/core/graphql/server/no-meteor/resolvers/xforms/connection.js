import { connectionFromArray, connectionFromPromisedArray } from "graphql-relay";

/**
 * @name xformArrayToConnection
 * @method
 * @memberof GraphQL/Transforms
 * @param {Object} connectionArgs GraphQL connection arguments
 * @param {Array} result The array of results
 * @return {Object} A connection shaped object of the results array
 */
export async function xformArrayToConnection(connectionArgs, result) {
  let connection;
  if (Array.isArray(result)) {
    connection = connectionFromArray(result, connectionArgs);
  } else {
    connection = await connectionFromPromisedArray(result, connectionArgs);
  }

  // XXX An optimization would be to do this map only if the client
  // actually asked for the `nodes` array.
  connection.nodes = connection.edges.map(({ node }) => node);

  return connection;
}
