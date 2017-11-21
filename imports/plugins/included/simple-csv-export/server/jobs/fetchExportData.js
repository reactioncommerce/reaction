import { Meteor } from "meteor/meteor";
import { Jobs, Orders } from "/lib/collections";
import Papa from "papaparse";

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
  Jobs.processJobs("orders/FetchExportDataSet", {
    pollInterval: 60 * 60 * 1000,
    workTimeout: 5 * 1000
  }, (job, callback) => {
    Meteor.call("orders/FetchExportDataSet", (error, data) => {
      if (error) {
        console.log("Error happened");
        job.fail("I failed this city");
      }
      const csv = Papa.unparse(data);
      downloadCSV(csv);
      job.done("Yaaay!!");
    });

    callback();
  });
}
