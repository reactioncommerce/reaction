import later from "later";
import moment from "moment";
import { Accounts, Cart, Jobs } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";

Hooks.Events.add("onJobServerStart", () => {
  Logger.debug("Adding Job removeStaleCart to jobControl");
  const existingCart = Cart.find({});
  if (existingCart) {
    new Job(Jobs, "cart/removeFromCart", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential" // delay by twice as long for each subsequent retry rt
      })
      .repeat({
        schedule: later.parse.text("every day")
      })
      .save({
        cancelRepeats: true
      });
  } else {
    Logger.warn("Cart does not currently exist");
  }
});

export default () => {
  const removeStaleCart = Jobs.processJobs("cart/removeFromCart", {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 180 * 1000
  }, (job, callback) => {
    // TODO: set this interval in the admin UI
    const olderThan = moment().subtract(3, "days")._d;
    Logger.debug("Processing cart/removeFromCart");
    const cartDetails = Cart.find({
      updatedAt: {
        $lte: olderThan
      }
    }).fetch();
    cartDetails.map(cart => {
      if (cart.items) {
        const findAcct = Accounts.find({ userId: cart.userId }).fetch();
        findAcct.map(user => {
          if (user.emails.length === 0) {
            const result = Cart.update(
              { userId: user._id },
              { $unset: { items: [] } }
            );
            if (result === 1) {
              const success = "Stale anonymous user cart successfully removed";
              Logger.info(success);
              job.done(success, { repeatId: true });
            }
          } else {
            const settings = Reaction.getShopSettings();
            const schedule = Number(settings.cart.cleanup); // configurable in shop settings
            if (!schedule) {
              Logger.warn("Cleanup Schedule not configured");
            } else {
              if (cart.updatedAt <= moment().subtract(schedule, "days")._d) {
                const userCleanup = Cart.update(
                  { userId: user._id },
                  { $unset: { items: [] } }
                );
                if (userCleanup === 1) {
                  const success = "Stale user cart successfully removed";
                  Logger.info(success);
                  job.done(success, { repeatId: true });
                }
              }
            }
          }
        });
      } else {
        Logger.info("Cart is currently empty");
      }
    });
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
