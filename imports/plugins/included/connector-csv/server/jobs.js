import _ from "lodash";
import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs } from "/lib/collections";
import { JobItems } from "../lib/collections";
import processJobItem from "./no-meteor/processJobItem";

/**
 * @name processJobItems
 * @summary Searches for jobItems and processes them
 * @return {undefined}
 */
async function processJobItems() {
  // Gather in progress collections of in progress jobs
  // and find pending job items that are not for those collections
  const inProgressJobItems = JobItems.find({ status: "inProgress" }).fetch();
  const inProgressColls = _.map(inProgressJobItems, "collection");
  const pendingJobItems = await JobItems.rawCollection().aggregate([
    { $match: { collection: { $nin: inProgressColls }, status: "pending" } },
    { $sort: { uploadedAt: -1 } },
    { $group: { _id: "$collection", projects: { $addToSet: "$$ROOT" } } }
  ]).toArray();
  pendingJobItems.forEach((collectionGroup) => {
    // Process only 1 of the pending job item from the group
    processJobItem(collectionGroup.projects[0]._id);
  });
  return true;
}

/**
 * @name generateProcessJobItemsJob
 * @summary Generate the job that processes jobItems
 * @return {undefined}
 */
export default function generateProcessJobItemsJob() {
  const jobId = "csvConnector/processJobItems";

  Hooks.Events.add("afterCoreInit", () => {
    new Job(Jobs, jobId, {})
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential"
      })
      .repeat({
        schedule: Jobs.later.parse.text("every 1 min")
      })
      .save({
        cancelRepeats: true
      });
  });

  const processJobItemJob = Jobs.processJobs(jobId, {
    pollInterval: 30 * 1000, // backup polling, see observer below
    workTimeout: 60 * 60 * 1000
  }, (job, callback) => {
    Logger.debug(`Processing ${jobId} job`);
    processJobItems();
    const doneMessage = `${jobId} job done`;
    Logger.debug(doneMessage);
    job.done(doneMessage, { repeatId: true });
    callback();
  });

  // Observer that triggers processing of job when ready
  Jobs.find({
    type: jobId,
    status: "ready"
  }).observe({
    added() {
      return processJobItemJob.trigger();
    }
  });
}
