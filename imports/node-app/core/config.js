import envalid, { bool, str } from "envalid";

export default envalid.cleanEnv(process.env, {
  GRAPHQL_INTROSPECTION_ENABLED: bool({ default: false }),
  GRAPHQL_PLAYGROUND_ENABLED: bool({ default: false }),
  // This is necessary to override the envalid default
  // validation for NODE_ENV, which uses
  // str({ choices: ['development', 'test', 'production'] })
  //
  // We currently need to set NODE_ENV to "jesttest" when
  // integration tests run.
  NODE_ENV: str()
});
