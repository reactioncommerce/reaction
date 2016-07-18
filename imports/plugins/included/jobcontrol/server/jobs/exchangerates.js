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
    const config = getJobConfig().settings.openexchangerates;
    if (config && config.appId) {
      const refreshPeriod = config.refreshPeriod || "Every 4 hours";
      Logger.info(`Adding shop/fetchCurrencyRates to JobControl. Refresh ${refreshPeriod}`);
      new Job(Jobs, "shop/fetchCurrencyRates", {})
        .priority("normal")
        .retry({
          retries: 5,
          wait: 60000,
          backoff: "exponential" // delay by twice as long for each subsequent retry
        })
        .repeat({
          schedule: Jobs.later.parse.text(refreshPeriod)
        })
        .save({
          // Cancel any jobs of the same type,
          // but only if this job repeats forever.
          cancelRepeats: true
        });
    } else {
      Logger.info("OpenExchangeRates API not configured. Not adding fetchRates job");
    }
  });

  Hooks.Events.add("afterCoreInit", () => {
    const config = getJobConfig().settings.openexchangerates;
    if (config && config.appId) {
      Logger.info("Adding shop/flushCurrencyRates to JobControl");
      const refreshPeriod = "Every 24 hours";
      new Job(Jobs, "shop/flushCurrencyRates", {})
        .priority("normal")
        .retry({
          retries: 5,
          wait: 60000,
          backoff: "exponential"
        })
        .repeat({
          schedule: Jobs.later.parse.text(refreshPeriod)
        })
        .save({
          cancelRepeats: true
        });
    } else {
      Logger.info("OpenExchangeRates API not configured. Not adding flushRates job");
    }
  });
}
