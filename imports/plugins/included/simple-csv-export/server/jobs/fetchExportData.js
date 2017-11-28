import Papa from "papaparse";
import { Meteor } from "meteor/meteor";
import { Job } from "meteor/vsivsi:job-collection";
import { Jobs } from "/lib/collections";
import { Hooks, Logger } from "/server/api";


// Hooks.Events.add("afterCoreInit", () => {
//   Logger.debug("Adding Job for export CSV");
//   new Job(Jobs, "fetchExportDataJob", {})
//     .priority("normal")
//     .retry({
//       retries: 5,
//       wait: 60000,
//       backoff: "exponential" // delay by twice as long for each subsequent retry
//     })
//     .save({
//       cancelRepeats: true
//     });
// });

// function exportOrdersToCSV() {
//   Meteor.call("orders/FetchExportDataSet", (error, data) => {
//     if (error) {
//       console.log("Error happened");
//     }
//     const csv = Papa.unparse(data);
//     downloadCSV(csv);
//   });
// }
//
// function exportOrdersToCSVByDate(startDate, endDate) {
//   Meteor.call("orders/ExportAllOrdersToCSVByDate", startDate, endDate, (error, data) => {
//     if (error) {
//       console.log("Error happened");
//     }
//     const csv = Papa.unparse(data);
//     downloadCSV(csv);
//   });
// }
//
// function downloadCSV(csv) {
//   const blob = new Blob([csv]);
//   const a = window.document.createElement("a");
// 	    a.href = window.URL.createObjectURL(blob, { type: "text/plain" });
// 	    a.download = "orders.csv";
// 	    document.body.appendChild(a);
// 	    a.click();
// 	    document.body.removeChild(a);
// }


export default function () {
  const fetchExportDataJob = Jobs.processJobs("fetchExportDataJob", {
    pollInterval: 60 * 60 * 1000,
    workTimeout: 7 * 10000
  }, (job, callback) => {
      console.log("I entered JOBS");
    Meteor.call("orders/orders/FetchExportData", (error, data) => {
      console.log(job.log(error), "job logged");
      if (error) {
        job.fail(error, "Job failed");
      } else {
        job.done("Success!!");
      }
    });

    callback();
  });

  Jobs.find({
    type: "fetchExportDataJob",
    status: "ready"
  }).observe({
    added() {
      return fetchExportDataJob.trigger();
    }
  });
}
