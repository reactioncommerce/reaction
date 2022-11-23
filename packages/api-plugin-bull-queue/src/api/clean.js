export default async function clean(context, queueName) {
  const queue = context.bullQueue.jobQueues[queueName];
  // cleans all jobs that completed over 5 seconds ago.
  queue.clean(5000);
  // clean all jobs that failed over 10 seconds ago.
  queue.clean(10000, "failed");
  queue.on("cleaned", (jobs, type) => {
    console.log("Cleaned %s %s jobs", jobs.length, type);
  });
}
