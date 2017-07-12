/* global Gravatar */
import _ from "lodash";
import * as Collections from "/lib/collections";

export default function sortUsersIntoGroups(accounts, groups) {
  const newGroups = groups.map(group => {
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
