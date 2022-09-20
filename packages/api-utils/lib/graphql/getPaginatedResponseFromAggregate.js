/* eslint-disable quote-props */
import applyOffsetPaginationToMongoAggregate from "./applyOffsetPaginationToMongoAggregate.js";
import applyPaginationToMongoAggregate from "./applyPaginationToMongoAggregate.js";
import getMongoSort from "./getMongoSort.js";

/**
 * Resolvers that return multiple documents in the form of a connection should construct a
 * MongoDB aggregation pipeline, pass the pipeline to this function, and then return the result.
 *
 * @name getPaginatedResponseFromAggregate
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Given a MongoDB aggregation pipeline, adds skip, limit, sort, and other filters as necessary
 *   based on GraphQL resolver arguments.
 * @param {MongoDB.Collection} collection MongoDB collection to run the aggregation pipeline on
 * @param {Array} pipeline MongoDB aggregation pipeline
 * @param {Object} args Connection arguments from GraphQL query
 * @param {Object} options Options
 * @param {Boolean} [options.includeTotalCount] Whether to return the `totalCount`. Default is `true`. Set this to
 *   `false` if you don't need it to avoid an extra database command.
 * @param {Boolean} [options.includeHasPreviousPage] Whether to return the `pageInfo.hasPreviousPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @param {Boolean} [options.includeHasNextPage] Whether to return the `pageInfo.hasNextPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @returns {Promise<Object>} `{ nodes, pageInfo, totalCount }`
 */
async function getPaginatedResponseFromAggregate(collection, pipeline, args, {
  includeHasNextPage = true,
  includeHasPreviousPage = true,
  includeTotalCount = true
} = {}) {
  const { after, before, last, offset, sortBy, sortOrder } = args;

  if (after !== undefined || before !== undefined) {
    throw new Error("Connection args `after` and `before` aren't supported by getPaginatedResponseFromAggregate");
  }

  // Get the total count, prior to adding before/after filtering
  let totalCount = null;
  if (includeTotalCount) {
    pipeline.push({
      /**
       * This stage gathers all of the objects that the pipeline has returned into a single array in one document.
       * Because we have all the documents in a single array, we can now count them using $sum. Unfortunately the only
       * way to count the number of returned objects with aggregates, as `.count()` is not available on aggregates.
       */
      $group: {
        _id: null,
        objects: {
          $addToSet: "$$ROOT"
        },
        totalCount: {
          $sum: 1
        }
      }
    }, {
      /**
       * Now that we've calculated the total count of objects, we can $unwind our array in our single object to get
       * individual objects again.
       */
      $unwind: {
        path: "$objects"
      }
    }, {
      /**
       * Set `totalCount` inside of our objects, since we'll replace the root in the next stage.
       */
      $set: {
        "$objects.totalCount": "$totalCount"
      }
    }, {
      /**
       * Replace the root. We now have all the objects that were returned by the pipeline originally, but with a new
       * `totalCount` field in each of them that contains the total count of objects returned.
       */
      $replaceRoot: {
        newRoot: "$objects"
      }
    });
  }

  // Get a MongoDB sort object
  const sort = getMongoSort({ sortBy, sortOrder });

  pipeline.push({
    "$sort": sort
  });

  let hasPreviousPage;
  let hasNextPage;

  if (offset !== undefined) {
    // offset and last cannot be used together
    if (last) throw new Error("Request either `last` or `offset` but not both");

    ({
      hasPreviousPage,
      hasNextPage,
      // eslint-disable-next-line no-param-reassign
      pipeline
    } = await applyOffsetPaginationToMongoAggregate(collection, pipeline, args, {
      includeHasNextPage
    }));
  } else {
    // Skip calculating pageInfo if it wasn't requested. Saves a db count command.
    ({
      hasPreviousPage,
      hasNextPage,
      // eslint-disable-next-line no-param-reassign
      pipeline
    } = await applyPaginationToMongoAggregate(collection, pipeline, args, {
      includeHasNextPage,
      includeHasPreviousPage
    }));
  }

  // Figure out proper hasNext/hasPrevious
  const pageInfo = {};
  if (includeHasNextPage) {
    pageInfo.hasNextPage = hasNextPage;
  }
  if (includeHasPreviousPage) {
    pageInfo.hasPreviousPage = hasPreviousPage;
  }

  const nodes = await collection.aggregate(pipeline).toArray();
  const count = nodes.length;
  if (count) {
    pageInfo.startCursor = nodes[0]._id;
    pageInfo.endCursor = nodes[count - 1]._id;

    if (includeTotalCount) {
      // eslint-disable-next-line prefer-destructuring
      totalCount = nodes[0].totalCount;
    }
  } else if (includeTotalCount) {
    // if includeTotalCount was requested but we're returning 0 nodes, set it to 0
    totalCount = 0;
  }

  return { pipeline, nodes, pageInfo, totalCount };
}

export default getPaginatedResponseFromAggregate;

