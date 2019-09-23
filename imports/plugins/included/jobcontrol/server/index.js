import { cleanupJob, addCleanupJobControlHook } from "./jobs/cleanup";

addCleanupJobControlHook();
cleanupJob();
