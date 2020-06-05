/**
 * @description Returns the account that sent the invitation
 * @param {Object} parent - the object that's being returned
 * @param {Any} _ - unused
 * @param {Object} context - the app context
 * @returns {Promise<Object|null>|null} - the account that sent the invitation
 */
export default function invitedBy(parent, _, context) {
  const { invitedByUserId } = parent;
  if (!invitedByUserId) return null;

  return context.queries.accountByUserId(context, invitedByUserId);
}
