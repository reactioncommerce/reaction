import { Meteor } from "meteor/meteor";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Hooks, Logger, Reaction } from "/server/api";
import { Jobs, Packages } from "/lib/collections";

// helper to fetch shippo config
function getJobConfig() {
  return Packages.findOne({
    name: "reaction-shippo",
    shopId: Reaction.getShopId()
  }).settings;
}

// helper to get owner's UserId
function getOwnerUserId() {
  const owner = Meteor.users.findOne({
    "roles.__global_roles__": "owner"
  });
  if (owner && typeof owner === "object") {
    return owner._id;
  }
  return false;
}

export function setupShippoTrackingStatusHook() {
  Hooks.Events.add("afterCoreInit", () => {
    const config = getJobConfig();
    const { refreshPeriod } = config;

    if (!config.shippo.enabled || !refreshPeriod) {
      return;
    }
    // there might be some validity to this being Logger.info.
    Logger.debug(`Adding shippo/fetchTrackingStatusForOrders to JobControl. Refresh ${refreshPeriod}`);
    new Job(Jobs, "shippo/fetchTrackingStatusForOrdersJob", {})
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
  });
}

export function fetchTrackingStatusForOrdersJob() {
  const ownerId = getOwnerUserId();
  if (ownerId) {
    Jobs.processJobs(
      "shippo/fetchTrackingStatusForOrdersJob",
      {
        pollInterval: 30 * 1000,
        workTimeout: 180 * 1000
      },
      (job, callback) => {
        // TODO review meteor runAsUser and add to project documentation
        // As this is run by the Server and we don't have userId()/this.userId
        // which "shippo/fetchTrackingStatusForOrders" need, we use dispatch:run-as-user
        // An alternative way is https://forums.meteor.com/t/cant-set-logged-in-user-for-rest-calls/18656/3
        Meteor.runAsUser(ownerId, () => {
          Meteor.call("shippo/fetchTrackingStatusForOrders", (error) => {
            if (error) {
              job.done(error.toString(), { repeatId: true });
            } else {
              const success = "Shippo tracking status updated.";
              Logger.debug(success);
              job.done(success, { repeatId: true });
            }
          });
        });
        callback();
      }
    );
  }
  return false;
}
