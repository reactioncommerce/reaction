/**
 * Returns the account that sent the invitation
 * @param parent
 * @param _
 * @param context
 * @returns {Promise<Object|null>|null}
 */
export default function invitedBy(parent, _, context) {
  const { invitedByUserId } = parent;
  if (!invitedByUserId) return null;

  return context.queries.accountByUserId(context, invitedByUserId);
}
