/**
 * @summary Return an account, given a user ID
 * @param {Object} context App context
 * @param {String} userId User ID
 * @return {Promise<Object|null>} Account
 */
export default function accountByUserId(context, userId) {
  return context.collections.Accounts.findOne({ userId });
}
