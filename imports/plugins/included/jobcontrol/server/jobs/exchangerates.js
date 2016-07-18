import { Jobs, Packages } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";

function getJobConfig() {
  const config = Packages.findOne({
    name: "core",
    shopId: Reaction.getShopId()
  });
  return config;
}

if (Hooks) {
  Hooks.Events.add("afterCoreInit", () => {
    Logger.info("Adding shop/fetchCurrencyRates to JobControl");
    const config = getJobConfig();
    if (config.appId) {
      new Job(Jobs, "shop/fetchCurrencyRates", {})
        .priority("normal")
        .retry({
          retries: 5,
          wait: 60000,
          backoff: "exponential" // delay by twice as long for each subsequent retry
        })
        .repeat({
          schedule: Jobs.later.parse.text(config.refreshPeriod)
        })
        .save({
          // Cancel any jobs of the same type,
          // but only if this job repeats forever.
          cancelRepeats: true
        });
    }
  });
}
