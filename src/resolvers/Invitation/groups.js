/**
 * Return group by ID
 * @param parent
 * @param _
 * @param context
 * @returns {Promise<*[]>}
 */
export default async function groups(parent, _, context) {
  const group = await context.queries.group(context, parent.groupId);

  return [group];
}
