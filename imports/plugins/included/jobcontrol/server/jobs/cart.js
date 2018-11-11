import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Accounts, Cart, Jobs } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Job } from "/imports/plugins/core/job-collection/lib";
import moment from "moment";

/**
 * @param {Object} olderThan older than date
 * @return {Object} stale carts
 * @private
 */
const getStaleCarts = (olderThan) => Cart.find({ updatedAt: { $lte: olderThan } }).fetch();

/**
 * @summary Adds an afterCoreInit hook for removing stale carts
 * @returns {undefined}
 */
export function setupStaleCartHook() {
  Hooks.Events.add("afterCoreInit", () => {
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
      const carts = getStaleCarts(olderThan);
      if (carts && carts.length) {
        const totalLength = carts.length;
        let currentRun = 0;
        carts.forEach((cart) => {
          const account = Accounts.findOne({ _id: cart.accountId });
          if (account) {
            const removeCarts = Cart.remove({ accountId: account._id });
            if (account) {
              if (!account.emails.length && removeCarts) {
                Accounts.remove({
                  _id: account._id,
                  emails: []
                });
                Hooks.Events.run("afterAccountsRemove", null, account._id);
                Meteor.users.remove({ _id: account.userId, emails: [] }); // clears out anonymous user
                Logger.info("Stale anonymous user cart and account successfully cleaned");
              } else if (removeCarts) {
                Logger.info("Stale anonymous user cart and account successfully cleaned");
              }
            }
          } else {
            Cart.remove({ _id: cart._id });
            Logger.info("Removed just this cart");
          }
          currentRun += 1;
          job.progress(
            currentRun,
            totalLength,
            { echo: true }
          );
        });
      } else { Logger.info("No carts found"); }
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
