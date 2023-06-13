import { cleanEnv, str, bool, num } from "envalid";
import dotenv from "dotenv";

dotenv.config();

export default cleanEnv(process.env, {
  REACTION_WORKERS_ENABLED: bool({ default: true }),
  REDIS_SERVER: str(),
  JOBS_SERVER_REMOVE_ON_COMPLETE: bool({ default: false }),
  JOBS_SERVER_REMOVE_ON_FAIL: bool({ default: false }),
  JOBS_SERVER_DEFAULT_ATTEMPTS: num({ default: 5 }),
  JOBS_SERVER_BACKOFF_MS: num({ default: 5000 }),
  JOBS_SERVER_BACKOFF_STRATEGY: str({ default: "exponential" }),
  JOBS_SERVER_REMOVE_COMPLETED_JOBS_AFTER: str({ default: "3 days" }),
  JOBS_SERVER_REMOVE_FAILED_JOBS_AFTER: str({ default: "30 days" })
});
