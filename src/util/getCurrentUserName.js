/**
 * @name getCurrentUserName
 * @method
 * @private
 * @param  {Object} currentUser - User
 * @returns {String} Name of currentUser or "Admin"
 */
export default function getCurrentUserName(currentUser) {
  if (currentUser) {
    if (currentUser.profile && currentUser.profile.name) {
      return currentUser.profile.name;
    }

    if (currentUser.name) {
      return currentUser.name;
    }

    if (currentUser.username) {
      return currentUser.username;
    }
  }

  return "Admin";
}
