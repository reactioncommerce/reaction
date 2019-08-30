import { cleanupJob, addCleanupJobControlHook } from "./jobs/cleanup";
import { fetchRateJobs, setupFetchFlushCurrencyHooks } from "./jobs/exchangerates";

addCleanupJobControlHook();
cleanupJob();

setupFetchFlushCurrencyHooks();
fetchRateJobs();
