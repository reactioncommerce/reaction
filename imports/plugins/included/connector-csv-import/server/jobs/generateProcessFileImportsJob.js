import csv from "csv";
import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { saveCSVToDB } from "@reactioncommerce/reaction-import-connectors";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs } from "/lib/collections";
import { ImportJobs } from "../../lib/collections";
import { NoMeteorImportFiles } from "/imports/plugins/core/connectors-new/server";


async function processFileImport() {
  const inProgressimportJob = ImportJobs.findOne({ status: "inProgress" });
  const pendingImportJob = ImportJobs.findOne({ status: "pending" });
  if (pendingImportJob && !inProgressimportJob) {
    ImportJobs.update(pendingImportJob._id, { $set: { status: "inProgress" } });
    const fileRecord = await NoMeteorImportFiles.findOne({ "metadata.importJobId": pendingImportJob._id });
    const readStream = await fileRecord.createReadStreamFromStore("importFiles");
    const getCSVRows = new Promise((resolve, reject) => {
      readStream.on("data", (data) => {
        let columns = true;
        if (!pendingImportJob.hasHeader) {
          columns = (row) => row.map((item, index) => index);
        }
        csv.parse(data, { columns }, (error, csvRows) => {
          if (error) {
            reject(error);
          }
          resolve(csvRows);
        });
      });
    });
    try {
      const csvRows = await getCSVRows;
      const withErrorData = await saveCSVToDB(pendingImportJob, csvRows);
      ImportJobs.update(pendingImportJob._id, { $set: { status: "done" } });
    } catch (error) {
      Logger.error(error);
      ImportJobs.update(pendingImportJob._id, { $set: { status: "fileRejected" } });
    }
  }
  return;
}

export default function generateProcessFileImportsJob() {
  const jobId = "connector/processFileImports";

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

  const processFileImportJob = Jobs.processJobs(jobId, {
    pollInterval: 30 * 1000, // backup polling, see observer below
    workTimeout: 60 * 60 * 1000
  }, (job, callback) => {
    Logger.info(`Processing ${jobId} job`);
    processFileImport();
    const doneMessage = `${jobId} job done`;
    Logger.info(doneMessage);
    job.done(doneMessage, { repeatId: true });
    callback();
  });

  // Observer that triggers processing of job when ready
  Jobs.find({
    type: jobId,
    status: "ready"
  }).observe({
    added() {
      return processFileImportJob.trigger();
    }
  });
}
