import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";
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

// helper to run code from Server Side, as a user with userId,
// through a created current method invocation
function runAsUser(userId, func) {
  const invocation = new DDPCommon.MethodInvocation({
    isSimulation: false,
    userId: userId,
    setUserId: () => {
    },
    unblock: () => {
    },
    connection: {},
    randomSeed: Math.random()
  });

  DDP._CurrentInvocation.withValue(invocation, () => {
    func();
  });
}

Hooks.Events.add("afterCoreInit", () => {
  const config = getJobConfig();
  const refreshPeriod = config.refreshPeriod;

  if (!config.shippo.enabled || !refreshPeriod) {
    return;
  }

  Logger.info(`Adding shippo/fetchTrackingStatusForOrders to JobControl. Refresh ${refreshPeriod}`);
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

export default function () {
  const ownerId = getOwnerUserId();
  if (ownerId) {
    Jobs.processJobs(
      "shippo/fetchTrackingStatusForOrdersJob",
      {
        pollInterval: 30 * 1000,
        workTimeout: 180 * 1000
      },
      (job, callback) => {
        // As this is run by the Server and we don't have userId()/this.userId
        // which "shippo/fetchTrackingStatusForOrders" need, we create a new current method invocation
        // which has the userId of Owner.
        runAsUser(ownerId, () => {
          Meteor.call("shippo/fetchTrackingStatusForOrders", error => {
            if (error) {
              job.done(error.toString(), { repeatId: true });
            } else {
              const success = "Latest Shippo's Tracking Status of Orders fetched successfully.";
              Logger.info(success);
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
