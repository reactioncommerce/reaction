import envalid, { bool, str } from "envalid";

export default envalid.cleanEnv(process.env, {
  // This is necessary to override the envalid default
  // validation for NODE_ENV, which uses
  // str({ choices: ['development', 'test', 'production'] })
  //
  // We currently need to set NODE_ENV to "jesttest" when
  // integration tests run.
  NODE_ENV: str(),
  SKIP_FIXTURES: bool({ default: false })
});
