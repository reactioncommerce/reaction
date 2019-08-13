import graphqlFields from "graphql-fields";

/**
  * @name optimizeIdOnly
  * @method
  * @memberof GraphQL/ResolverUtilities
  * @description  * This is an optimization so that we can avoid a database lookup if, for example, the client
  * has requested only `shop { _id }` and we already have `shopId` prop from the parent resolver.
  * @param {String} _id id to optimize
  * @param {Object} info info on fields
  * @param {Function} queryFunc query function
  * @returns {Object} `{ nodes, pageInfo, totalCount }`
  */
export default function optimizeIdOnly(_id, info, queryFunc) {
  const topLevelFields = Object.keys(graphqlFields(info));

  // If only the _id was requested, we already have that. Save a DB call.
  if (topLevelFields.length === 1 && topLevelFields[0] === "_id") {
    return () => Promise.resolve({ _id });
  }

  return queryFunc;
}
