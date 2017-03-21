import later from "later";
import moment from "moment";
import { Accounts, Cart, Jobs } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";
import { ServerSessions } from "/server/publications/collections/sessions";


Hooks.Events.add("onJobServerStart", () => {
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
        schedule: later.parse.text("every day")
      })
      .save({
        cancelRepeats: true
      });
  } else {
    Logger.warn("No cart cleanup schedule");
  }
});

export default () => {
  const removeStaleCart = Jobs.processJobs("cart/removeFromCart", {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 180 * 1000
  }, (job, callback) => {
    Logger.debug("Processing cart/removeFromCart");
    const settings = Reaction.getShopSettings();
    if (settings.cart) {
      const schedule = (settings.cart.cleanupDurationDays).match(/\d/);// configurable in shop settings
      const olderThan = moment().subtract(Number(schedule[0]), "days")._d;
      const cartDetails = Cart.find({
        updatedAt: {
          $lte: olderThan
        }
      }).fetch();
      cartDetails.map(cart => {
        const anonUser = Accounts.findOne({
          _id: cart.userId,
          emails: []
        });
        if (cart.items) {
          if (anonUser) {
            const removeCart = Cart.remove({ userId: anonUser._id });
            const removeAccount = Accounts.remove(
              {
                _id: cart.userId,
                emails: []
              }
            );
            const destroySession = ServerSessions.remove({ _id: cart.sessionId });
            Meteor.users.remove({ emails: [] }); // clears out anonymous user
            if (removeCart && removeAccount && destroySession) {
              const success = "Stale anonymous user cart and account successfully cleaned";
              Logger.debug(success);
              job.done(success, { repeatId: true });
            }
          } else {
            const user = Accounts.findOne({ _id: cart.userId });
            if (cart.updatedAt <= moment().subtract(Number(schedule[0]), "days")._d) {
              const userCleanup = Cart.update(
                { userId: user._id },
                { $unset: { items: [] } }
              );
              if (userCleanup === 1) {
                const success = "Stale user cart successfully cleaned";
                Logger.debug(success);
                job.done(success, { repeatId: true });
              }
            }
          }
        } else {
          Logger.debug("No item in cart");
        }
      });
    } else {
      Logger.warn("No cart cleanup schedule");
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
};
