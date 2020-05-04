/**
 * @name accounts
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Returns accounts optionally filtered by group IDs
 * @param {Object} context - an object containing the per-request state
 * @param {String} input - input for query
 * @param {String} [input.groupIds] - Array of group IDs to limit the results
 * @returns {Promise} Mongo cursor
 */
export default async function accounts(context, input) {
  const { collections } = context;
  const { AccountInvites } = collections;

  await context.validatePermissions("reaction:legacy:invitations", "read");

  return {
    collection: AccountInvites,
    pipeline: [
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
    ]
  };
}
