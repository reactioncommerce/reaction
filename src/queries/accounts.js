/**
 * @name accounts
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Returns accounts optionally filtered by group IDs
 * @param {Object} context - an object containing the per-request state
 * @param {String} input - input for query
 * @param {String} [input.groupIds] - Array of group IDs to limit the results
 * @param {String} [input.notInAnyGroups] - Return accounts that aren't part of any groups
 * @returns {Promise} Mongo cursor
 */
export default async function accounts(context, input) {
  const { collections } = context;
  const { Accounts } = collections;
  const { groupIds, notInAnyGroups } = input;

  await context.validatePermissions("reaction:legacy:accounts", "read");

  const selector = {};
  if (groupIds && notInAnyGroups) {
    selector.$or = [
      {
        groups: {
          $in: groupIds
        }
      }, {
        groups: {
          $in: [null, []]
        }
      }
    ];
  } else if (groupIds) {
    selector.groups = { $in: groupIds };
  } else if (notInAnyGroups) {
    selector.groups = { $in: [null, []] };
  }

  return Accounts.find(selector);
}
