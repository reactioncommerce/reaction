import later from "later";
import moment from "moment";
import { Accounts, Cart, Jobs } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";

const olderThan = moment().subtract(3, "days")._d;

Hooks.Events.add("onJobServerStart", () => {
  Logger.debug("Adding Job removeStaleCart to jobControl");
  const staleCarts = Cart.find({
    updatedAt: {
      $lte: olderThan
    }
  }).fetch();
  if (staleCarts) {
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
    Logger.info("No stale carts at the moment");
  }
});

export default () => {
  const removeStaleCart = Jobs.processJobs("cart/removeFromCart", {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 180 * 1000
  }, (job, callback) => {
    Logger.debug("Processing cart/removeFromCart");
    const cartDetails = Cart.find({
      updatedAt: {
        $lte: olderThan
      }
    }).fetch();
    cartDetails.map(cart => {
      if (cart.items) {
        const user = Accounts.findOne({ userId: cart.userId });
        if (!user.emails.length) {
          const result = Cart.update(
            { userId: user._id },
            { $unset: { items: [] } }
          );
          if (result === 1) {
            const success = "Stale anonymous user cart successfully cleaned";
            Logger.debug(success);
            job.done(success, { repeatId: true });
          }
        } else {
          const settings = Reaction.getShopSettings();
          const schedule = Number(settings.cart.cleanup); // configurable in shop settings
          if (!schedule) {
            Logger.warn("Cleanup Schedule not configured");
          } else {
            if (cart.updatedAt <= moment().subtract(schedule, "mins")._d) {
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
        }
      } else {
        Logger.debug("Cart is currently empty");
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
