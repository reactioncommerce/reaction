export default async function empty(context, queueName) {
  const queue = context.bullQueue.jobQueues[queueName];
  if (queue) {
    console.log("emptying queue");
    return queue.empty();
  }
  return false;
}
