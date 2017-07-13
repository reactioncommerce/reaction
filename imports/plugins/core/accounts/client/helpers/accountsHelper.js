/* global Gravatar */
import _ from "lodash";
import * as Collections from "/lib/collections";

/**
 * sortUsersIntoGroups - helper - client
 * @summary puts each full user object into an array on the group they belong
 * @param {Array} accounts - list of user account objects
 * @param {Array} groups - list of permission groups
 * @return {Array} - array of groups, each having a `users` field
 */
export default function sortUsersIntoGroups(accounts, groups) {
  // Review: The thought here is to use how many permissions defined for the group as a means of sorting
  // to determine the order groups are shown in the dashboard
  const sortedGroups = groups.sort((prev, next) => next.permissions.length - prev.permissions.length);

  const newGroups = sortedGroups.map(group => {
    const matchingAccounts = accounts.map(acc => {
      if (acc.groups && acc.groups.indexOf(group._id) > -1) {
        return acc;
      }
    });
    group.users = _.compact(matchingAccounts);
    return group;
  });
  return newGroups;
}

export function getGravatar(user) {
  const options = {
    secure: true,
    size: 30,
    default: "identicon"
  };
  if (!user) { return false; }
  const account = Collections.Accounts.findOne(user._id);
  if (account && account.profile && account.profile.picture) {
    return account.profile.picture;
  }
  if (user.emails && user.emails.length > 0) {
    const email = user.emails[0].address;
    return Gravatar.imageUrl(email, options);
  }
}
