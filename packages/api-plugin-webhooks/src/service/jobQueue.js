let isBusy = false;

const queue = [];

export function enqueueRequest(job) {
  queue.push(job);
}

export async function processRequest() {
  if (isBusy) {
    return;
  }

  isBusy = true;

  let job;

  while (job = queue.pop()) {
    if (typeof job.process === "function") {
      try {
        const result = await job.process();
        await job.onSuccess(result);
      } catch (e) {
        await job.onError(e);
      }
    }
  }

  isBusy = false;
}
