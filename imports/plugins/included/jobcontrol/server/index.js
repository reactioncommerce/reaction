import "./jobs/exchangerates";
import "./jobs/cleanup";
import cleanupJob from "./jobs/cleanup";
import fetchRateJobs from "./jobs/exchangerates";

cleanupJob();
fetchRateJobs();
