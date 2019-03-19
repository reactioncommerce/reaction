import envalid, { bool } from "envalid";

export default envalid.cleanEnv(process.env, {
  GRAPHQL_INTROSPECTION_ENABLED: bool({ default: false }),
  GRAPHQL_PLAYGROUND_ENABLED: bool({ default: false })
});

