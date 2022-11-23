import envalid from "envalid";

export default envalid.cleanEnv(process.env, {
  REACTION_WORKERS_ENABLED: envalid.bool({ default: true }),
  VERBOSE_JOBS: envalid.bool({ default: false }),
  REDIS_SERVER: envalid.str({ default: "redis://127.0.0.1:6379" })
}, {
  dotEnvPath: null
});
