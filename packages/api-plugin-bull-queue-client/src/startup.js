async function sendFakeEmail(jobData) {
  console.log("I sent a fake email", jobData);
}

async function doSomeBackgroundWork(jobData) {
  console.log("hey hey, doing some stuff in the background occasionally", jobData);
}


export default async function startupJobClient(context) {
  const { bullQueue } = context;
  bullQueue.createQueue(context, "emailQueue", {}, sendFakeEmail);
  await bullQueue.empty(context, "emailQueue");
  bullQueue.createQueue(context, "backgroundWork", {}, doSomeBackgroundWork);
  bullQueue.addJob(context, "emailQueue", { address: "fake1@example.org", body: "hello everybody1" });
  bullQueue.addJob(context, "emailQueue", { address: "fake2@example.org", body: "hello everybody2" });
  bullQueue.scheduleJob(context, "backgroundWork", { someData: "thing" }, { repeat: { cron: "*/1 * * * *" } });
  const emailJobs = await bullQueue.getJobs(context, "emailQueue");
  console.log(`Currently ${emailJobs.length} jobs in the email queue`);
  bullQueue.clean(context, "emailQueue");
}
