import { Jobs, ProductSearch } from "/lib/collections";
import { Hooks, Logger } from "/server/api";
import { buildProductSearchCollection } from "../methods/";


Hooks.Events.add("afterCoreInit", () => {
  const productSearchCount = ProductSearch.find({}).count();
  if (!productSearchCount) {
    Logger.info("No ProductSearch records found. Adding build ProductSearch Collection to jobs");
    new Job(Jobs, "product/buildSearchCollection", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential"
      })
      .save({
        cancelRepeats: true
      });
  } else {
    Logger.info("ProductSearch collection already exists, not building");
  }
});


export default function () {
  Logger.info("Build search collections job processors");
  Jobs.processJobs("product/buildSearchCollection",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Logger.info("(re)build ProductSearch collection running");
      buildProductSearchCollection(function (error) {
        if (error) {
          job.done(error.toString(), {repeatId: true});
          callback();
        } else {
          const success = "ProductSearch collection (re)built successfully.";
          Logger.info(success);
          job.done(success, { repeatId: true });
          callback();
        }
      });
    }
  );
}

