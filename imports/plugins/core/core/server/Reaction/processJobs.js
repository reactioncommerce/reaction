import processEmailJobs from "./processEmailJobs";

/**
 * @summary Process background jobs
 * @returns {undefined}
 */
export default function processJobs() {
  processEmailJobs();
}
