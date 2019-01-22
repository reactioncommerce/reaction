import Logger from "@reactioncommerce/logger";
import { Cart, Jobs } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Job } from "/imports/plugins/core/job-collection/lib";
import moment from "moment";

/**
 * @summary Adds an afterCoreInit hook for removing stale carts
 * @returns {undefined}
 */
export function setupStaleCartHook() {
  appEvents.on("afterCoreInit", () => {
    Logger.debug("Adding Job removeStaleCart and Accounts to jobControl");
    const settings = Reaction.getShopSettings();
    if (settings.cart) {
      new Job(Jobs, "cart/removeFromCart", {})
        .priority("normal")
        .retry({
          retries: 5,
          wait: 60000,
          backoff: "exponential" // delay by twice as long for each subsequent retry
        })
        .repeat({
          schedule: Jobs.later.parse.text("every day")
        })
        .save({
          cancelRepeats: true
        });
    } else {
      Logger.debug("No cart cleanup schedule");
    }
  });
}

/**
 * @summary A background job for removing stale carts
 * @returns {undefined}
 */
export function cartCleanupJob() {
  const removeStaleCart = Jobs.processJobs("cart/removeFromCart", {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 180 * 1000
  }, (job, callback) => {
    Logger.info("Processing cart/removeFromCart");
    const settings = Reaction.getShopSettings();
    if (settings.cart) {
      const schedule = (settings.cart.cleanupDurationDays).match(/\d/);// configurable in shop settings
      const olderThan = moment().subtract(Number(schedule[0]), "days")._d;
      Logger.info("removing carts older than", olderThan);
      Cart.remove({ updatedAt: { $lte: olderThan } }, { multi: true });
      const success = "Cart cleanup job completed";
      Logger.info(success);
      job.done(success);
    } else {
      Logger.debug("No cart cleanup schedule");
    }
    callback();
  });
  Jobs.find({
    type: "cart/removeFromCart",
    status: "ready"
  }).observe({
    added() {
      return removeStaleCart.trigger();
    }
  });
}
