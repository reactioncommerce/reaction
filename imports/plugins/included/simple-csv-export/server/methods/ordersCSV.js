import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Job } from "meteor/vsivsi:job-collection";
import { Jobs, Orders } from "/lib/collections";
import fetchExportDataJobs from "../jobs/fetchExportData";


export const methods = {
  /**
   * orders/ExportAllOrdersToCSV this function parses a JSON format of the Orders collection
   * into a CSV formatted file
   * @return {Array} an array with columns and rows
   */
  "orders/orders/FetchExportData": () => {
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
    console.log("I entered fetching orders");
    return { fields: fields, data: data };
  },
  "orders/ExportAllOrdersToCSVByDate": (startDate, endDate) => {
    check(startDate, String);
    check(endDate, String);

    const fields = [
      "_id",
      "sessionId",
      "userId",
      "shopId",
      "discount",
      "tax",
      "cartId",
      "email",
      "createdAt"
    ];
    const data = [];

    const orders = Orders.find({
      $gte: new Date(startDate.toISOString()),
      $lte: new Date(endDate.toISOString())
    }).fetch();
    _.each(orders, (rows) => {
      data.push([
        rows._id,
        rows.sessionId,
        rows.userId,
        rows.shopId,
        rows.discount,
        rows.tax,
        rows.cartId,
        rows.email,
        rows.createdAt
      ]);
    });
    return { fields: fields, data: data };
  },
  "orders/beginExportToCsvJob": () => {
    new Job(Jobs, "fetchExportDataJob", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential" // delay by twice as long for each subsequent retry
      })
      .save({
        cancelRepeats: true
      });
      console.log("I dey here");
  }
};


// export methods to Meteor
Meteor.methods(methods);
