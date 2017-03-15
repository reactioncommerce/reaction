import later from "later";
import moment from "moment";
import { Cart, Jobs } from "/lib/collections";
import { Hooks, Logger } from "/server/api";

Hooks.Events.add("onJobServerStart", () => {
  Logger.debug("Adding Job removeStaleCart to jobControl");
  const existingCart = Cart.find({});
  if (existingCart) {
    new Job(Jobs, "cart/removeFromCart", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential" // delay by twice as long for each subsequent retry
      })
      .repeat({
        schedule: later.parse.text("every 1 mins")
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
      if (cart.items || cart.items.length > 0) {
        Meteor.call("cart/removeFromCart", (error) => {
          if (error) {
            if (error.error === "cart-not-found") {
              Logger.error(error.message);
              job.done(error.message, { repeatId: true });
            } else {
              job.done(error.toString(), { repeatId: true });
            }
          } else {
            const success = "Stale cart successfully removed";
            Logger.debug(success);
            job.done(success, { repeatId: true });
          }
        });
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
