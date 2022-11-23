export default async function pauseQueue(context, queueName) {
  const queue = context.bullQueue.jobQueues[queueName];
  queue.pause();
  console.log("queue paused", queueName);
}
