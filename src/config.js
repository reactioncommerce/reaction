import envalid from "envalid";

const { bool } = envalid;

export default envalid.cleanEnv(process.env, {
  REACTION_WORKERS_ENABLED: bool({ default: true }),
  VERBOSE_JOBS: bool({ default: false })
}, {
  dotEnvPath: null
});
