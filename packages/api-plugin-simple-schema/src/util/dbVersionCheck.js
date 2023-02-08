import doesDatabaseVersionMatch from "@reactioncommerce/db-version-check";
import { migrationsNamespace } from "../../migrations/migrationsNamespace.js";

const expectedVersion = 2;

const simpleSchemaIntrospectPermissions = [
  "reaction:legacy:simpleSchema/introspect"
];

/**
 * @summary Checks if the version of the database matches requirement
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function dbVersionCheck(context) {
  const setToExpectedIfMissing = async () => {
    // Check if atleast one of the simpleSchema introspect permissions exist in the roles collection
    const existingRole = await context.collections.roles.findOne({ name: { $in: simpleSchemaIntrospectPermissions } });
    const rolesFound = !!existingRole;

    // We are not checking for the existence of the permissions in the groups collection
    // as they could be customised by the specific implementation

    // if there are NO accounts & groups then this is a fresh database and we can pass true
    const anyAccount = await context.collections.Accounts.findOne();
    const anyGroup = await context.collections.Groups.findOne();

    return rolesFound || (!anyAccount && !anyGroup);
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
