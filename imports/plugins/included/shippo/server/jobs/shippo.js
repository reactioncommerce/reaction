import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";
import { Logger, Reaction } from "/server/api";
import { Jobs, Packages } from "/lib/collections";

// helper to fetch shippo config
function getJobConfig() {
  return Packages.findOne({
    name: "reaction-shippo",
    shopId: Reaction.getShopId()
  }).settings;
}

Meteor.methods({ "shippo/startJobs"() {
  const userId = this.userId;
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

  Jobs.processJobs(
    "shippo/fetchTrackingStatusForOrdersJob",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
    // As this block of code ,doesn't keep Meteor.userId()/this.userId
    // which "shippo/fetchTrackingStatusForOrders" need, we create a new current method invocation
    // in the server which has the userId set as the user which processed the Job.
      const invocation = new DDPCommon.MethodInvocation({
        isSimulation: false,
        userId: userId,
        setUserId: ()=>{},
        unblock: ()=>{},
        connection: {},
        randomSeed: Math.random()
      });

      DDP._CurrentInvocation.withValue(invocation, () => {
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
});

