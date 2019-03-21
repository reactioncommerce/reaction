import { cleanupJob, addCleanupJobControlHook } from "./jobs/cleanup";
import { fetchRateJobs, setupFetchFlushCurrencyHooks } from "./jobs/exchangerates";
import "./i18n";

addCleanupJobControlHook();
cleanupJob();

setupFetchFlushCurrencyHooks();
fetchRateJobs();
