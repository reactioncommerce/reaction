export default async function resumeQueue(context, queueName) {
  const queue = context.bullQueue.jobQueues[queueName];
  await queue.resume();
  console.log("queue resumed", queueName);
}
