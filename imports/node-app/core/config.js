import envalid, { bool, str } from "envalid";

export default envalid.cleanEnv(process.env, {
  GRAPHQL_INTROSPECTION_ENABLED: bool({ default: false }),
  GRAPHQL_PLAYGROUND_ENABLED: bool({ default: false }),
  MIGRATION_BYPASS_ENABLED: bool({
    default: false,
    desc: "Bypasses migration version checks and migration runs. Enables startup if migration state is not compatible. " +
      "This can be dangerous enough to cause data inconsistencies. Use at your own risk!"
  }),
  // This is necessary to override the envalid default
  // validation for NODE_ENV, which uses
  // str({ choices: ['development', 'test', 'production'] })
  //
  // We currently need to set NODE_ENV to "jesttest" when
  // integration tests run.
  NODE_ENV: str(),
  SKIP_FIXTURES: bool({ default: false })
});
