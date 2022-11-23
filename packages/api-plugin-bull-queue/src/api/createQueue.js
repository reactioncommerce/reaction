import Queue from "bull";
import config from "../config.js";

const { REDIS_SERVER } = config;

export default function createQueue(context, queueName, options, processorFn) {
  console.log("creating queue", queueName);
  const newQueue = new Queue(queueName, REDIS_SERVER);
  context.bullQueue.jobQueues[queueName] = newQueue;
  newQueue.process((job) => processorFn(job.data));
  return newQueue;
}
