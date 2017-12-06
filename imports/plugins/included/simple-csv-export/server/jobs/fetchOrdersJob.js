import _ from "lodash";
import Papa from "papaparse";
import { Meteor } from "meteor/meteor";
// import { Logger } from "/server/api";
import { Jobs, Orders } from "/lib/collections";

const iEntered = () => {
  const fields = [
    "_id",
    "sessionId",
    "userId",
    "shopId",
    "workflow",
    "billing",
    "discount",
    "tax",
    "shipping",
    "items",
    "cartId",
    "email",
    "createdAt"
  ];
  const data = [];

  const orders = Orders.find().fetch();
  _.each(orders, (rows) => {
    data.push([
      rows._id,
      rows.sessionId,
      rows.userId,
      rows.shopId,
      JSON.stringify(rows.workflow),
      JSON.stringify(rows.billing),
      rows.discount,
      rows.tax,
      JSON.stringify(rows.shipping),
      JSON.stringify(rows.items),
      rows.cartId,
      rows.email,
      rows.createdAt
    ]);
  });
  // return { fields: fields, data: data };
  const csvCollection = new FS.Collection("csvCollection", {
    stores: [new FS.Store.GridFS("csvCollection")]
  });
  csvCollection.allow({
    insert: function () {
      return true;
    }
  });
  const csv = Papa.unparse({ fields: fields, data: data });
  const file = new FS.File(csv);
  file.encoding = "binary";
  file.name("orders.csv");
  csvCollection.insert(file);
  const document = csvCollection.insert(file);
  console.log(document._id, "abi the document ID");
};

export default function () {
  const fetchOrdersJob = Jobs.processJobs("fetchOrdersJob", {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 18000 * 1000
  }, (job, callback) => {
    iEntered();
    console.log("I worked finally");
    job.done("Job completed");
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
