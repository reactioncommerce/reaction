import { Job } from "/imports/plugins/core/job-collection/lib";
import { Meteor } from "meteor/meteor";
import { Accounts, Cart, Jobs } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";
import { ServerSessions } from "/server/publications/collections/sessions";

let moment;
async function lazyLoadMoment() {
  if (moment) return;
  moment = await import("moment");
}


/**
 * {Function} that fetches stale carts
 * @param {Object} olderThan older than date
 * @return {Object} stale carts
 */
const getstaleCarts = (olderThan) => Cart.find({ updatedAt: { $lte: olderThan } }).fetch();


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
      const carts = getstaleCarts(olderThan);
      carts.forEach((cart) => {
        const user = Accounts.findOne({ _id: cart.userId });
        if (!user.emails.length) {
          const removeCart = Cart.remove({ userId: user._id });
          const removeAccount = Accounts.remove({
            _id: cart.userId,
            emails: []
          });
          Hooks.Events.run("afterAccountsRemove", null, user._id);
          const destroySession = ServerSessions.remove({ _id: cart.sessionId });
          Meteor.users.remove({ _id: user._id, emails: [] }); // clears out anonymous user
          if (removeCart && removeAccount && destroySession) {
            const success = "Stale anonymous user cart and account successfully cleaned";
            Logger.debug(success);
            job.done(success, { repeatId: true });
          }
        } else {
          Cart.remove({ userId: user._id });
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
