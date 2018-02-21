import { Meteor } from "meteor/meteor";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs, ProductSearch, Orders, OrderSearch, AccountSearch } from "/lib/collections";
import { Hooks, Logger } from "/server/api";
import {
  buildAccountSearch,
  buildEmptyProductSearch,
  buildOrderSearch,
  buildProductSearch,
  rebuildProductSearchIndex
} from "../methods/";


function addBuildProductSearchCollection() {
  const productSearchCount = ProductSearch.find({}).count();
  if (!productSearchCount) {
    Logger.debug("No ProductSearch records found. Adding build ProductSearch Collection to jobs");
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
    Logger.debug("ProductSearch collection already exists, not building");
  }
}

function addBuildOrderSearchCollection() {
  const orderSearchCount = OrderSearch.find({}).count();
  const orderCount = Orders.find({}).count();
  if (!orderSearchCount && orderCount) {
    Logger.debug("No OrderSearch records found. Adding build OrderSearch Collection to jobs");
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
    Logger.debug("OrderSearch collection already exists (or no orders), not building");
  }
}

function addBuildAccountSearchCollection() {
  const accountSearchCount = AccountSearch.find({}).count();
  if (!accountSearchCount) {
    Logger.debug("No AccountSearch records found. Adding build AccountSearch Collection to jobs");
    new Job(Jobs, "account/buildSearchCollection", {})
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
    Logger.debug("AccountSearch collection already exists, not building");
  }
}

Hooks.Events.add("afterCoreInit", () => {
  if (!Meteor.isAppTest) {
    buildEmptyProductSearch();
    addBuildProductSearchCollection();
    addBuildOrderSearchCollection();
    addBuildAccountSearchCollection();
  }
});


export default function () {
  Jobs.processJobs(
    "product/buildSearchCollection",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Logger.debug("(re)build ProductSearch collection running");
      buildProductSearch((error) => {
        if (error) {
          job.done(error.toString(), { repeatId: true });
          callback();
        } else {
          const success = "ProductSearch collection (re)built successfully.";
          Logger.debug(success);
          job.done(success, { repeatId: true });
          callback();
        }
      });
    }
  );

  Jobs.processJobs(
    "product/buildSearchIndex",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Logger.debug("(re)build ProductSearch index running");
      rebuildProductSearchIndex((error) => {
        if (error) {
          job.done(error.toString(), { repeatId: true });
          callback();
        } else {
          const success = "ProductSearch Index (re)built successfully.";
          Logger.debug(success);
          job.done(success, { repeatId: true });
          callback();
        }
      });
    }
  );

  Jobs.processJobs(
    "order/buildSearchCollection",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Logger.debug("(re)build OrderSearch index running");
      buildOrderSearch((error) => {
        if (error) {
          job.done(error.toString(), { repeatId: true });
          callback();
        } else {
          const success = "OrderSearch collection (re)built successfully.";
          Logger.debug(success);
          job.done(success, { repeatId: true });
          callback();
        }
      });
    }
  );

  Jobs.processJobs(
    "account/buildSearchCollection",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Logger.debug("(re)build AccountSearch index running");
      buildAccountSearch((error) => {
        if (error) {
          job.done(error.toString(), { repeatId: true });
          callback();
        } else {
          const success = "AccountSearch collection (re)built successfully.";
          Logger.debug(success);
          job.done(success, { repeatId: true });
          callback();
        }
      });
    }
  );
}
