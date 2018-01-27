import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";

Meteor.methods({
  /**
   * We're using https://taxcloud.net
   * just to get an intial import data set
   * this service doesn't require taxcloud id
   * but other services need authorization
   * use TAXCODE_SRC  to override source url
   * @returns {Array} An array of Tax code objects
   */
  "taxcloud/getTaxCodes"() {
    const taxCodeArray = [];
    const TAXCODE_SRC = "https://taxcloud.net/tic/?format=json";
    const taxCodes = HTTP.get(TAXCODE_SRC);

    if (taxCodes) {
      taxCodes.data.tic_list.forEach((code) => {
        if (code.tic.children) {
          code.tic.children.forEach((child) => {
            taxCodeArray.push(child.tic);
          });
        }
        taxCodeArray.push(code.tic);
      });
      return taxCodeArray;
    }
    throw new Meteor.Error("retrieval-failed", "Error getting tax codes");
  }
});
