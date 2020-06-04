import envalid from "envalid";

export default envalid.cleanEnv(process.env, {
  REACTION_WORKERS_ENABLED: envalid.bool({ default: true }),
  VERBOSE_JOBS: envalid.bool({ default: false })
}, {
  dotEnvPath: null
});
