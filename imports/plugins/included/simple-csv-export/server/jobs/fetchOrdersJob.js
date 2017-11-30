// import { Meteor } from "meteor/meteor";
// import { Logger } from "/server/api";
import { Jobs } from "/lib/collections";

const iEntered = () => {
  console.log("I am a banana");
}

export default function () {
  const fetchOrdersJob = Jobs.processJobs("fetchOrdersJob", {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 180 * 1000
  }, (job, callback) => {
    iEntered();
    callback();
  });

  Jobs.find({
    type: "fetchOrdersJob",
    status: "ready"
  }).observe({
    added() {
      return fetchOrdersJob.trigger();
    }
  });
}
