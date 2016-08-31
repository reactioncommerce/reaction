import { Jobs, ProductSearch, Orders, OrderSearch } from "/lib/collections";
import { Hooks, Logger } from "/server/api";
import { buildProductSearch,
  rebuildProductSearchIndex,
  buildOrderSearch } from "../methods/";


function addBuildProductSearchCollection() {
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
}

function addBuildOrderSearchCollection() {
  const orderSearchCount = OrderSearch.find({}).count();
  const orderCount = Orders.find({}).count();
  if (!orderSearchCount && orderCount) {
    Logger.info("No OrderSearch records found. Adding build OrderSearch Collection to jobs");
    new Job(Jobs, "order/buildSearchCollection", {})
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
    Logger.info("OrderSearch collection already exists, not building");
  }
}

Hooks.Events.add("afterCoreInit", () => {
  addBuildProductSearchCollection();
  addBuildOrderSearchCollection();
});


export default function () {
  Jobs.processJobs("product/buildSearchCollection",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Logger.info("(re)build ProductSearch collection running");
      buildProductSearch(function (error) {
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

  Jobs.processJobs("product/buildSearchIndex",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Logger.info("(re)build ProductSearch index running");
      rebuildProductSearchIndex(function (error) {
        if (error) {
          job.done(error.toString(), {repeatId: true});
          callback();
        } else {
          const success = "ProductSearch Index (re)built successfully.";
          Logger.info(success);
          job.done(success, { repeatId: true });
          callback();
        }
      });
    }
  );

  Jobs.processJobs("order/buildSearchCollection",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Logger.info("(re)build OrderSearch index running");
      buildOrderSearch(function (error) {
        if (error) {
          job.done(error.toString(), {repeatId: true});
          callback();
        } else {
          const success = "OrderSearch collection (re)built successfully.";
          Logger.info(success);
          job.done(success, { repeatId: true });
          callback();
        }
      });
    }
  );
}

