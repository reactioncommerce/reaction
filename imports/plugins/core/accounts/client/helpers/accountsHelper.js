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

export default function getSortedGroups(shopUsers, groups) {
  const allGroups = getFilteredGroups(groups);
  const sortedGroups = {};
  Object.keys(allGroups).forEach((groupName) => {
    sortedGroups[groupName] = shopUsers.filter(function (user) {
      return user.groups.length > 0 && allGroups[groupName].ids.includes(user.groups[0]);
    });
    sortedGroups[groupName].groupData = Object.assign({}, { ...allGroups[groupName] });
  });
  return sortedGroups;
}
