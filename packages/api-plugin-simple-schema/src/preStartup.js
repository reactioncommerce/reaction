import doesDatabaseVersionMatch from "@reactioncommerce/db-version-check";
import { migrationsNamespace } from "../migrations/migrationsNamespace.js";

const expectedVersion = 2;

const simpleSchemaIntrospectPermissions = [
  "reaction:legacy:simpleSchema/introspect:*",
  "reaction:legacy:simpleSchema/introspect:Cart",
  "reaction:legacy:simpleSchema/introspect:Product",
  "reaction:legacy:simpleSchema/introspect:Order",
  "reaction:legacy:simpleSchema/introspect:Account",
  "reaction:legacy:simpleSchema/introspect:Promotion"
];

/**
 * @summary Checks if the version of the database matches requirement
 * @param {Object} context Startup context
 * @returns {undefined}
 */
async function dbVersionCheck(context) {
  const setToExpectedIfMissing = async () => {
    // Check if atleast one of the simpleSchema introspect permissions exist in the roles collection
    const allRoles = await context.collections.roles.find().toArray();
    let rolesFound = false;
    if (allRoles && Array.isArray(allRoles) && allRoles.length) {
      rolesFound = allRoles.some((role) => simpleSchemaIntrospectPermissions.includes(role.name));
    }

    // We are not checking for the existence of the permissions in the groups collection
    // as they could be customised by the specific implementation

    return rolesFound;
  };

  const ok = await doesDatabaseVersionMatch({
    // `db` is a Db instance from the `mongodb` NPM package,
    // such as what is returned when you do `client.db()`
    db: context.app.db,
    // These must match one of the namespaces and versions
    // your package exports in the `migrations` named export
    expectedVersion,
    namespace: migrationsNamespace,
    setToExpectedIfMissing
  });

  if (!ok) {
    throw new Error(`Database needs migrating. The "${migrationsNamespace}" namespace must be at version ${expectedVersion}.`);
  }
}

/**
 * @summary Called before startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function simpleSchemaPreStartup(context) {
  await dbVersionCheck(context);
}
