import envalid from "envalid";
import dotenv from "dotenv";

dotenv.config();

export default envalid.cleanEnv(process.env, {
  REACTION_WORKERS_ENABLED: envalid.bool({ default: true }),
  REDIS_SERVER: envalid.str(),
  JOBS_SERVER_REMOVE_ON_COMPLETE: envalid.bool({ default: false }),
  JOBS_SERVER_REMOVE_ON_FAIL: envalid.bool({ default: false }),
  JOBS_SERVER_DEFAULT_ATTEMPTS: envalid.num({ default: 5 }),
  JOBS_SERVER_BACKOFF_MS: envalid.num({ default: 5000 }),
  JOBS_SERVER_BACKOFF_STRATEGY: envalid.str({ default: "exponential" }),
  JOBS_SERVER_REMOVE_COMPLETED_JOBS_AFTER: envalid.str({ default: "3 days" }),
  JOBS_SERVER_REMOVE_FAILED_JOBS_AFTER: envalid.str({ default: "30 days" })
});
