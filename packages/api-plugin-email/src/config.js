import envalid from "envalid";

export default envalid.cleanEnv(process.env, {
  REACTION_WORKERS_ENABLED: envalid.bool({ default: true })
}, {
  dotEnvPath: null
});
