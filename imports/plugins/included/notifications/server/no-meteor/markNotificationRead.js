import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @method
 * @summary Update a notification's status to "read"
 * @param {Object} collections - Map of MongoDB collections
 * @param {String} id - The notification ID
 * @return {undefined}
 */
export default async function markNotificationRead(collections, id) {
  const { matchedCount } = await collections.Notifications.updateOne({ _id: id }, {
    $set: {
      status: "read"
    }
  });
  if (matchedCount !== 1) throw new ReactionError("server-error", "Unable to update cart");
}
