import envalid from "envalid";

export default envalid.cleanEnv(process.env, {
  REACTION_WORKERS_ENABLED: envalid.bool({ default: true }),
  VERBOSE_JOBS: envalid.bool({ default: false }),
  REDIS_SERVER: envalid.str({ default: "redis://127.0.0.1:6379" }),
  JOBS_SERVER_REMOVE_ON_COMPLETE: envalid.bool({ default: false }),
  JOBS_SERVER_REMOVE_ON_FAIL: envalid.bool({ default: false }),
  JOBS_SERVER_DEFAULT_ATTEMPTS: envalid.num({ default: 5 }),
  JOBS_SERVER_BACKOFF_MS: envalid.num({ default: 5000 }),
  JOBS_SERVER_BACKOFF_STRATEGY: envalid.str({ default: "exponential" })
}, {
  dotEnvPath: null
});
