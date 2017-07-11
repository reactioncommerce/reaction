/* globals Gravatar */
import * as Collections from "/lib/collections";

function getFilteredGroups(groups) {
  const allGroups = {};
  groups.forEach((group) => {
    if (!allGroups.hasOwnProperty(group.name)) {
      allGroups[group.name] = Object.assign({}, { group }, { ids: [group._id] });
    } else {
      allGroups[group.name].ids.push(group._id);
    }
  });
  return allGroups;
}

export function getSortedGroups(shopUsers, groups) {
  const allGroups = getFilteredGroups(groups);
  const sortedGroups = {};
  Object.keys(allGroups).forEach((groupName) => {
    sortedGroups[groupName] = shopUsers.filter(function (user) {
      return user.groups.length > 0 && allGroups[groupName].ids.includes(user.groups[0]);
    });
    sortedGroups[groupName].groupData = Object.assign({}, { ...allGroups[groupName].group }, { ...allGroups[groupName] });
  });
  return sortedGroups;
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
