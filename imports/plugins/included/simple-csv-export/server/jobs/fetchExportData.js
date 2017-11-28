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

function exportOrdersToCSV() {
  Meteor.call("orders/FetchExportDataSet", (error, data) => {
    if (error) {
      console.log("Error happened");
    }
    const csv = Papa.unparse(data);
    downloadCSV(csv);
  });
}

function exportOrdersToCSVByDate(startDate, endDate) {
  Meteor.call("orders/ExportAllOrdersToCSVByDate", startDate, endDate, (error, data) => {
    if (error) {
      console.log("Error happened");
    }
    const csv = Papa.unparse(data);
    downloadCSV(csv);
  });
}

function downloadCSV(csv) {
  const blob = new Blob([csv]);
  const a = window.document.createElement("a");
	    a.href = window.URL.createObjectURL(blob, { type: "text/plain" });
	    a.download = "orders.csv";
	    document.body.appendChild(a);
	    a.click();
	    document.body.removeChild(a);
}


export default function () {
  console.log("I entered JOBS");
  // const fetchExportDataJob =
  Jobs.processJobs("fetchExportDataJob", {
    pollInterval: 30 * 1000,
    workTimeout: 180 * 1000
  }, (job, callback) => {
    Meteor.call("orders/orders/FetchExportData", (error, data) => {
      if (error) {
        job.done("I failed this city");
        callback();
      } else {
        const csv = Papa.unparse(data);
        downloadCSV(csv);
        job.done("Yaaay!!");
        callback();
      }
    });

    callback();
  });

  // Jobs.find({
  //   type: "fetchExportDataJob",
  //   status: "ready"
  // }).observe({
  //   added() {
  //     return fetchExportDataJob.trigger();
  //   }
  // });
}
