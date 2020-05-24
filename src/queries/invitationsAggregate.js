/**
 * @name accounts
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Returns accounts optionally filtered by group IDs
 * @param {Object} context - an object containing the per-request state
 * @param {String} input - input for query
 * @param {String} [input.shopIds] - Array of shop IDs to limit the results
 * @returns {Promise} Mongo cursor
 */
export default async function accounts(context, { shopIds }) {
  const { collections } = context;
  const { AccountInvites } = collections;

  const pipeline = [];

  if (Array.isArray(shopIds) && shopIds.length > 0) {
    await Promise.all(shopIds.map((shopId) => context.validatePermissions("reaction:legacy:groups", "manage:accounts", { shopId })));

    pipeline.push({
      $match: {
        shopId: {
          $in: shopIds
        }
      }
    })
  } else {
    await context.validatePermissions("reaction:legacy:invitations", "read");
  }

  pipeline.push(
    {
      $lookup: {
        from: "Shops",
        localField: "shopId",
        foreignField: "_id",
        as: "shop"
      }
    },
    {
      $unwind: {
        path: "$shop"
      }
    },
    {
      $lookup: {
        from: "Groups",
        localField: "groupIds",
        foreignField: "_id",
        as: "groups"
      }
    },
    {
      $lookup: {
        from: "Accounts",
        localField: "invitedByUserId",
        foreignField: "userId",
        as: "invitedBy"
      }
    },
    {
      $unwind: {
        path: "$invitedBy"
      }
    },
    {
      $project: {
        groupIds: 0,
        invitedByUserId: 0
      }
    }
  );

  return {
    collection: AccountInvites,
    pipeline
  };
}
