import doesDatabaseVersionMatch from "@reactioncommerce/migrator-version-check";

const expectedVersion = 2;
const namespace = "legacy-authorization";

/**
 * @summary Called before startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function preStartup(context) {
  const ok = await doesDatabaseVersionMatch({
    // `db` is a Db instance from the `mongodb` NPM package,
    // such as what is returned when you do `client.db()`
    db: context.app.db,
    // These must match one of the namespaces and versions
    // your package exports in the `migrations` named export
    expectedVersion,
    namespace
  });

  if (!ok) {
    throw new Error(`Database needs migrating. The "${namespace}" namespace must be at version ${expectedVersion}`);
  }
}
