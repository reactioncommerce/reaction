import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import ImportableCollections from "@reactioncommerce/reaction-import-connectors";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs } from "/lib/collections";
import { ImportJobs } from "../../lib/collections";
import { processImportFile } from "../utils/importFile";

/**
 * @summary TODO
 * @param {Function} callback - TODO
 * @returns {Object} the callback
 * @private
 */
export function setupFileImportHook() {
  Hooks.Events.add("afterCoreInit", () => {
    Logger.info("Adding file import job.");
    new Job(Jobs, "connector/fileImport", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential"
      })
      .save({
        cancelRepeats: true
      });
  });
}

/**
 * @summary TODO
 * @param {String} fileImportId - TODO
 * @returns {Object} the callback
 * @private
 */
export function addFileImportJob(fileImportId = "") {
  Jobs.processJobs(
    "connector/fileImport",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    async (job, callback) => {
      console.log(ImportableCollections);
      let importJob;
      if (fileImportId) {
        importJob = ImportJobs.findOne({ _id: fileImportId, status: "new" });
      } else {
        importJob = ImportJobs.findOne({ status: "new" });
      }
      if (importJob) {
        Logger.info(`Running file import ${importJob._id}`);
        try {
          await processImportFile(importJob);
          const success = `File import for ${importJob._id}$ successful`;
          Logger.info(success);
          callback();
        } catch (error) {
          job.done(error.toString());
          callback();
        }
      }
    }
  );
}
