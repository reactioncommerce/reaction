/**
 * @name accounts
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Accounts collection and a list of non-admin accounts
 * @param {Object} context - an object containing the per-request state
 * @param {String} input - input for query
 * @param {String} input.shopId - Shop ID to get accounts for
 * @returns {Promise} Mongo cursor
 */
export default async function accounts(context, input) {
  const { checkPermissions, collections } = context;
  const { Accounts, Groups } = collections;
  const { shopId } = input;

  await checkPermissions(["reaction-accounts"], shopId);

  const groups = await Groups.find({
    name: { $in: ["guest", "customer"] },
    shopId
  }, {
    fields: { _id: 1 }
  }).toArray();

  const groupIds = groups.map((group) => group._id);

  return Accounts.find({
    groups: { $in: groupIds },
    shopId
  });
}
