/**
 * @summary create a scheduled job
 * @param {Object} context - The application context
 * @param {String} queueName - The queue to add this job
 * @param {Object} jobData - Data to be passed to the worker
 * @param {String} schedule - The schedule as a crontab
 * @return {Boolean} - true if success
 */
export default function scheduleJob(context, queueName, jobData, schedule) {
  const thisQueue = context.bullQueue.jobQueues[queueName];
  thisQueue.add(jobData, schedule);
  return true;
}
