const DEFAULT_LIMIT = 20;

/**
 * @summary Performs a MongoDB query where an array of IDs in one collection
 *   is used as the list and the list order, and the documents matching
 *   those IDs from another collection are returned.
 * @param {String} arrayFieldPath The field name or path in `collection`
 *   where the value is an array of IDs
 * @param {Object} collection A MongoDB Collection instance
 * @param {Object} connectionArgs Relay-compatible connection arguments.
 *   `before` and `after` are document IDs from `joinCollectionName`
 * @param {String} joinCollectionName The name of the collection to join, which
 *   contains the documents that will be returned.
 * @param {Object} [projection] An optional projection to limit the fields included
 *   from `joinCollectionName` collection.
 * @param {Object} selector MongoDB selector by which to look up the array
 *   field value in `collection`
 * @return {Object[]} Array of found documents in correct sort
 */
export default async function arrayJoinQuery({
  arrayFieldPath,
  collection,
  connectionArgs: {
    after,
    before,
    first,
    last,
    sortOrder = "asc"
  },
  positionFieldName = "joinArrayPosition",
  joinCollectionName,
  projection,
  selector
}) {
  const dollarFieldPath = `$${arrayFieldPath}`;

  const sort = sortOrder === "asc" ? 1 : -1;

  const beforeAfterFields = {
    arrayFieldCount: { $size: dollarFieldPath }
  };

  let beforeAfterSlice = [dollarFieldPath, "$arrayFieldCount"];
  if (last) {
    beforeAfterFields.beforeArrayIndex = { $indexOfArray: [dollarFieldPath, before] };
    beforeAfterSlice = [
      dollarFieldPath,
      {
        $cond: {
          if: {
            $eq: ["$beforeArrayIndex", -1]
          },
          then: {
            $max: [
              { $subtract: ["$arrayFieldCount", last] },
              0
            ]
          },
          else: {
            $max: [
              { $subtract: ["$beforeArrayIndex", last] },
              0
            ]
          }
        }
      },
      {
        $cond: {
          if: {
            $eq: ["$beforeArrayIndex", -1]
          },
          then: {
            $min: [last, "$arrayFieldCount"]
          },
          else: {
            $min: [last, "$beforeArrayIndex"]
          }
        }
      }
    ];
  } else {
    beforeAfterFields.afterArrayIndex = { $indexOfArray: [dollarFieldPath, after] };
    beforeAfterSlice = [
      dollarFieldPath,
      { $add: ["$afterArrayIndex", 1] },
      {
        $min: [
          first || DEFAULT_LIMIT,
          {
            $subtract: [
              { $add: ["$arrayFieldCount", 1] },
              "$afterArrayIndex"
            ]
          }
        ]
      }
    ];
  }

  const pipeline = [
    {
      $match: selector
    },
    {
      $addFields: beforeAfterFields
    },
    {
      $addFields: {
        slicedArray: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$beforeArrayIndex", 0] },
                { $eq: ["$afterArrayIndex", "$arrayFieldCount"] }
              ]
            },
            then: [],
            else: { $slice: beforeAfterSlice }
          }
        }
      }
    },
    {
      $lookup: {
        from: joinCollectionName,
        let: {
          slicedArray: "$slicedArray"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$slicedArray"]
              }
            }
          },
          {
            $addFields: {
              [positionFieldName]: {
                $indexOfArray: ["$$slicedArray", "$_id"]
              }
            }
          },
          {
            $sort: {
              [positionFieldName]: sort
            }
          }
        ],
        as: "arrayDocs"
      }
    },
    {
      $unwind: "$arrayDocs"
    },
    {
      $replaceRoot: { newRoot: "$arrayDocs" }
    }
  ];

  if (projection) {
    pipeline.push({
      $project: projection
    });
  }

  return collection.aggregate(pipeline).toArray();
}
