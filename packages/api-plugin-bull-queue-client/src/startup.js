import _ from "lodash";
import Random from "@reactioncommerce/random";

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleep(ms) {
  await timeout(ms);
  return true;
}

async function sendFakeEmail(jobData) {
  console.log("I sent a fake email", jobData);
}

async function doSomeBackgroundWork(jobData) {
  console.log("hey hey, doing some stuff in the background occasionally", jobData);
}

async function longRunningTask(jobData) {
  console.log("starting long running task");
  await sleep(3000);
  console.log("completed longRunningTask", jobData);
  return true;
}

async function delayedTask(jobData) {
  console.log("running a delayed task", jobData.delay);
}


export default async function startupJobClient(context) {
  const { bullQueue } = context;
  // Create queue of various types
  bullQueue.createQueue(context, "emailQueue", {}, sendFakeEmail);
  await bullQueue.empty(context, "emailQueue");
  bullQueue.createQueue(context, "backgroundWork", {}, doSomeBackgroundWork);
  bullQueue.createQueue(context, "delayedTasks", {}, delayedTask);
  bullQueue.createQueue(context, "longRunningTaskQueue", {}, longRunningTask);
  await bullQueue.empty(context, "longRunningTaskQueue");
  bullQueue.createQueue(context, "longRunningTaskQueue", {}, longRunningTask);

  // add jobs
  bullQueue.addJob(context, "emailQueue", { address: "fake1@example.org", body: "hello everybody1" });
  bullQueue.addJob(context, "emailQueue", { address: "fake2@example.org", body: "hello everybody2" });
  bullQueue.scheduleJob(context, "backgroundWork", { someData: "thing" }, { repeat: { cron: "*/1 * * * *" } });
  _.times(15, () => {
    bullQueue.addJob(context, "longRunningTaskQueue", { hello: Random.id() });
  });
  let delay = 1000;
  _.times(30, () => {
    bullQueue.addDelayedJob(context, "delayedTasks", delay, { delay });
    delay += 30000;
  });
  const emailJobs = await bullQueue.getJobs(context, "emailQueue");
  console.log(`Currently ${emailJobs.length} jobs in the email queue`);
  const longRunningJobs = await bullQueue.getJobs(context, "longRunningTaskQueue");
  console.log(`Currently ${longRunningJobs.length} jobs in the lrt queue`);
  bullQueue.clean(context, "emailQueue");
  bullQueue.clean(context, "longRunningTaskQueue");
}
