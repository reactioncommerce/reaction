import graphqlFields from "graphql-fields";

/**
 * This is an optimization so that we can avoid a database lookup if, for example, the client
 * has requested only `shop { _id }` and we already have `shopId` prop from the parent resolver.
 *
 * @name optimizeIdOnly
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Wraps a query function, and calls it only if fields other than `_id` were requested
 *   in the GraphQL query.
 * @return {Object} `{ nodes, pageInfo, totalCount }`
 */
export default function optimizeIdOnly(_id, info, queryFunc) {
  const topLevelFields = Object.keys(graphqlFields(info));

  // If only the _id was requested, we already have that. Save a DB call.
  if (topLevelFields.length === 1 && topLevelFields[0] === "_id") {
    return () => Promise.resolve({ _id });
  }

  return queryFunc;
}
