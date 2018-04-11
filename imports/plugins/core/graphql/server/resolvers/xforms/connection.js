import { connectionFromArray, connectionFromPromisedArray } from "graphql-relay";

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
