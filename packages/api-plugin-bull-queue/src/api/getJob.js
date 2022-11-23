export default async function getJob(context, queueName, jobId) {
  const queue = context.bullQueue.jobQueues[queueName];
  return queue.getJob(jobId);
}
