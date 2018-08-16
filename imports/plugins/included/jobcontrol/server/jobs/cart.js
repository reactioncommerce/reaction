import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Accounts, Cart, Jobs } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Job } from "/imports/plugins/core/job-collection/lib";

let moment;
async function lazyLoadMoment() {
  if (moment) return;
  moment = await import("moment").default;
}

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
    Logger.debug("Processing cart/removeFromCart");
    const settings = Reaction.getShopSettings();
    if (settings.cart) {
      Promise.await(lazyLoadMoment());
      const schedule = (settings.cart.cleanupDurationDays).match(/\d/);// configurable in shop settings
      const olderThan = moment().subtract(Number(schedule[0]), "days")._d;
      const carts = getStaleCarts(olderThan);
      carts.forEach((cart) => {
        const account = Accounts.findOne({ _id: cart.accountId });
        const removeCart = Cart.remove({ accountId: account._id });
        if (!account.emails.length) {
          const removeAccount = Accounts.remove({
            _id: account._id,
            emails: []
          });
          Hooks.Events.run("afterAccountsRemove", null, account._id);
          Meteor.users.remove({ _id: account.userId, emails: [] }); // clears out anonymous user
          if (removeCart && removeAccount) {
            const success = "Stale anonymous user cart and account successfully cleaned";
            Logger.debug(success);
            job.done(success, { repeatId: true });
          }
        } else {
          const success = "Stale user cart successfully cleaned";
          Logger.debug(success);
          job.done(success, { repeatId: true });
        }
      });
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
