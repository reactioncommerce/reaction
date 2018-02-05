import { cleanupJob, addCleanupJobControlHook } from "./jobs/cleanup";
import { fetchRateJobs, setupFetchFlushCurrencyHooks } from "./jobs/exchangerates";
import { cartCleanupJob, setupStaleCartHook } from "./jobs/cart";
import "./i18n";

addCleanupJobControlHook();
cleanupJob();

setupFetchFlushCurrencyHooks();
fetchRateJobs();

setupStaleCartHook();
cartCleanupJob();
