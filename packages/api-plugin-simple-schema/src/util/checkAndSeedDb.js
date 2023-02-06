import Random from "@reactioncommerce/random";

const newPermissions = [
  "reaction:legacy:simpleSchema/introspect"
];


/**
  * @param {Object} context An object with request-specific state
  * @param {Function} dataloaderFactory dataloader factory
  * @param {Function} convertToDataloaderResult function to convert data to array
  * @returns {Array} converted result
  */
export default async function checkAndSeedDb(context) {
  const { collections: { roles: Roles, Groups } } = context;
  const allGroups = await Groups.find({}).toArray();

  for (const currentGroup of allGroups) {
    if (
      currentGroup.slug === "shop manager" ||
      currentGroup.slug === "system-manager" ||
      currentGroup.slug === "owner") { // adding permission only for these three groups for this migration
      const currentPerms = currentGroup.permissions;
      let permsToAdd = [];

      if (currentPerms && Array.isArray(currentPerms) && currentPerms.length) {
        newPermissions.forEach((newPermission) => {
          if (!currentPerms.includes(newPermission)) {
            permsToAdd.push(newPermission);
          }
        });
      } else {
        permsToAdd = [...newPermissions];
      }

      if (permsToAdd.length) {
        // eslint-disable-next-line no-await-in-loop
        await Groups.updateOne(
          { _id: currentGroup._id },
          {
            $addToSet: { permissions: { $each: permsToAdd } }
          }
        );
      }
    }
  }

  // Add new permissions to the roles collection
  let allRoles = await Roles.find({}).toArray();
  allRoles = allRoles.map((role) => role.name);

  const promises = newPermissions.map(async (permission) => {
    const trimmedPermission = permission.trim();
    if (!allRoles.includes(trimmedPermission)) {
      await Roles.insertOne({
        _id: Random.id(),
        name: trimmedPermission
      });
    }
  });
  await Promise.all(promises);
}
