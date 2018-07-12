import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs } from "/lib/collections";
import { ImportJobs } from "../../lib/collections";


/**
 * @summary TODO
 * @param {Function} callback - TODO
 * @returns {Object} the callback
 * @private
 */
function saveDataFromFile(callback) {
  const pkgData = taxCalc.getPackageData();
  if (pkgData && pkgData.settings.avalara.enabled) {
    const saveDuration = pkgData.settings.avalara.logRetentionDuration;
    const olderThan = moment().subtract(saveDuration, "days");
    const result = Logs.remove({
      date: {
        $lt: olderThan
      }
    });
    Logger.debug(`Removed ${result} Avalara log records`);
  }
  callback();
}

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
    (job, callback) => {
      let importJob;
      if (fileImportId) {
        importJob = ImportJobs.findOne({ _id: fileImportId, status: "new" });
      } else {
        importJob = ImportJobs.findOne({ status: "new" });
      }
      if (importJob) {
        Logger.info(`Running file import ${fileImportId}`);
      }
      saveDataFromFile((error) => {
        if (error) {
          job.done(error.toString());
          callback();
        } else {
          const success = `File import for `{importJob.id}` successful`;
          Logger.info(success);
          job.done(success);
          callback();
        }
      });
      callback();
    }
  );
}
