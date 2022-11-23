export default function addJob(context, queueName, jobData) {
  context.bullQueue.jobQueues[queueName].add(jobData);
}
