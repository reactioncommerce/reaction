import envalid, { bool, makeValidator, str } from "envalid";

const bodyParserValidator = makeValidator((value) => {
  if (typeof value !== "number") throw new Error("Expected type number letters");
  if (value <= 0) throw new Error("Expected value to be greater than 0");
  return value;
});

export default envalid.cleanEnv(process.env, {
  BODY_PARSER_SIZE_LIMIT: bodyParserValidator({
    default: 5 * 1000000 // value in bytes = 5mb
  }),
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
