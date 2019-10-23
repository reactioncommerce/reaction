import Random from "@reactioncommerce/random";

/**
 * @name ensureRoles
 * @summary Ensure a list of roles exist in the roles collection
 * @param {Object} context App context
 * @param {String[]} roles List of role names
 * @returns {undefined}
 */
export default async function ensureRoles(context, roles = []) {
  const {
    collections: {
      roles: Roles
    }
  } = context;

  let allRoles = await Roles.find({}).toArray();
  allRoles = allRoles.map((role) => role.name);

  const promises = roles.map(async (role) => {
    const trimmedRole = role.trim();
    if (!allRoles.includes(trimmedRole)) {
      await Roles.insertOne({
        _id: Random.id(),
        name: trimmedRole
      });
    }
  });

  await Promise.all(promises);
}
