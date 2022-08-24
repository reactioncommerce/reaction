const DEFAULT_LIMIT = 20;

/**
 * @summary Performs a MongoDB query where an array of IDs in one collection
 *   is used as the list and the list order, and the documents matching
 *   those IDs from another collection are returned.
 * @param {Object} connectionArgs Relay-compatible connection arguments.
 *   `before` and `after` are document IDs from `joinCollection`
 * @param {Array} joinArray List of value from join collection by which to look up
 * @param {String} joinCollection The collection to join, which
 *   contains the documents that will be returned.
 * @param {String} joinFieldPath The path to the field in joinCollection that is referenced by
 *   the items in joinArray
 * @param {String} positionFieldName Name of field to add to each document with its position index
 * @param {Object} [projection] An optional projection to limit the fields included
 *   from `joinCollection` collection.
 * @returns {Object[]} Array of found documents in correct sort
 */
export default async function arrayJoinQuery({
  connectionArgs: {
    after,
    before,
    first,
    last,
    sortOrder = "asc"
  },
  joinArray,
  joinCollection,
  joinFieldPath = "_id",
  joinSelector,
  positionFieldName = "joinArrayPosition",
  projection
}) {
  const dollarJoinFieldPath = `$${joinFieldPath}`;

  const sort = sortOrder === "asc" ? 1 : -1;

  const arrayFieldCount = joinArray.length;

  let slicedArray;
  if (last) {
    const beforeArrayIndex = joinArray.indexOf(before);
    if (beforeArrayIndex === 0) {
      slicedArray = [];
    } else {
      let start;
      let num;
      if (beforeArrayIndex === -1) {
        start = Math.max(arrayFieldCount - last, 0);
        num = Math.min(arrayFieldCount, last);
      } else {
        start = Math.max(beforeArrayIndex - last, 0);
        num = Math.min(beforeArrayIndex, last);
      }
      slicedArray = joinArray.slice(start, start + num);
    }
  } else {
    const afterArrayIndex = joinArray.indexOf(after);
    if (afterArrayIndex === arrayFieldCount) {
      slicedArray = [];
    } else {
      const start = afterArrayIndex + 1;
      const num = Math.min(first || DEFAULT_LIMIT, arrayFieldCount + 1 - afterArrayIndex);
      slicedArray = joinArray.slice(start, start + num);
    }
  }

  const pipeline = [
    {
      $match: {
        $and: [
          { [joinFieldPath]: { $in: slicedArray } },
          joinSelector
        ]
      }
    },
    {
      $addFields: {
        [positionFieldName]: {
          $indexOfArray: [joinArray, dollarJoinFieldPath]
        }
      }
    },
    {
      $sort: {
        [positionFieldName]: sort
      }
    }
  ];

  if (projection) {
    pipeline.push({
      $project: projection
    });
  }

  return joinCollection.aggregate(pipeline).toArray();
}
