import Random from "@reactioncommerce/random";

const COLLECTION_ROLES = "roles";
const COLLECTION_GROUPS = "Groups";

const newPermissions = [
  "reaction:legacy:simpleSchema/introspect"
];

/**
 * @summary migrates the database down one version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent number as argument.
 * @return {undefined}
 */
async function down({ db, progress }) {
  progress(0);

  const allGroups = await db.collection(COLLECTION_GROUPS).find({}).toArray();
  const affectedGroups = [];
  allGroups.forEach((group) => {
    if (group.slug === "shop manager" || group.slug === "owner" || group.slug === "system-manager") { // only these three groups for this migration
      const perms = group.permissions;
      if (perms && Array.isArray(perms) && perms.length) {
        const found = newPermissions.some((elem) => perms.includes(elem));
        if (found) affectedGroups.push(group.slug);
      }
    }
  });

  if (affectedGroups.length) {
    await db.collection(COLLECTION_GROUPS).updateMany({
      slug: { $in: affectedGroups }
    }, {
      $pullAll: { permissions: newPermissions }
    });
  }
  progress(50);

  // remove the permissions from the roles
  const allRoles = await db.collection(COLLECTION_ROLES).find({}).toArray();
  const affectedRoles = [];
  allRoles.forEach((role) => {
    const perm = role.name;
    if (newPermissions.includes(perm)) {
      affectedRoles.push(role._id);
    }
  });

  await db.collection(COLLECTION_ROLES).deleteMany({
    _id: { $in: affectedRoles }
  });

  progress(100);
}

/**
 * @summary Performs migration up from previous data version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent number as argument.
 * @return {undefined}
 */
async function up({ db, progress }) {
  progress(0);

  const allGroups = await db.collection(COLLECTION_GROUPS).find({}).toArray();

  for (let index = 0; index < allGroups.length; index += 1) {
    const currentGroup = allGroups[index];
    if (!(currentGroup.slug === "shop manager" || currentGroup.slug === "owner" || currentGroup.slug === "system-manager")) { // only these three groups for this migration
      progress(Math.floor(((index + 1) / (allGroups.length * 2)) * 100));
      continue;
    }
    const currentPerms = currentGroup.permissions;
    const permsToAdd = [];

    if (currentPerms && Array.isArray(currentPerms) && currentPerms.length) {
      newPermissions.forEach((newPermission) => {
        if (!currentPerms.includes(newPermission)) {
          permsToAdd.push(newPermission);
        }
      });
    }

    if (permsToAdd.length) {
      // eslint-disable-next-line no-await-in-loop
      await db.collection(COLLECTION_GROUPS).updateOne(
        { _id: currentGroup._id },
        {
          $addToSet: { permissions: { $each: permsToAdd } }
        }
      );
    }
    progress(Math.floor(((index + 1) / (allGroups.length * 2)) * 100));
  }

  // Add new permissions to the roles collection
  let allRoles = await db.collection(COLLECTION_ROLES).find({}).toArray();
  allRoles = allRoles.map((role) => role.name);

  const promises = newPermissions.map(async (permission) => {
    const trimmedPermission = permission.trim();
    if (!allRoles.includes(trimmedPermission)) {
      await db.collection(COLLECTION_ROLES).insertOne({
        _id: Random.id(),
        name: trimmedPermission
      });
    }
  });
  await Promise.all(promises);

  progress(100);
}

export default {
  down,
  up
};
