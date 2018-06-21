import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Reaction } from "server/api";
import { Packages } from "/lib/collections";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";


/**
 * @name buildTaxCode
 * @method
 * @summary parses the code returned from taxcloud api to Reaction's taxcode
 * @param {Object} code - code to convert
 * @returns {Object} - code compatible with TaxCode schema
 */
function buildTaxCode(code) {
  if (!code) {
    return {};
  }
  return {
    id: code.id,
    taxCode: code.id,
    shopId: Reaction.getShopId(),
    taxCodeProvider: "taxes-taxcloud",
    ssuta: code.ssuta,
    parent: code.parent,
    title: code.title,
    label: code.label
  }
}

/**
 * Meteor methods for TaxCloud. Run these methods using `Meteor.call()`
 * @namespace TaxCloud/Methods
 */

Meteor.methods({
  /**
   * We're using https://taxcloud.net just to get an intial import data set
   * this service doesn't require taxcloud id but other services need authorization
   * use TAXCODE_SRC to override source url
   * @name taxcloud/getTaxCodes
   * @method
   * @memberof TaxCloud/Methods
   * @returns {Array} An array of Tax code objects
   */
  "taxcloud/getTaxCodes"() {
    const TAXCODE_SRC = "https://api.taxcloud.net/1.0/TaxCloud/GetTICs";
    const taxCloudPackage = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getShopId(),
      name: "taxes-taxcloud",
      enabled: true
    }).settings;
    const taxCodes = HTTP.post(TAXCODE_SRC, {
      data: { apiLoginID: taxCloudPackage.taxcloud.apiLoginId, apiKey: taxCloudPackage.taxcloud.apiKey }
    });
    console.log("********************", taxCodes);
    if (!taxCodes) {
      throw new Meteor.Error("retrieval-failed", "Error getting tax codes");
    }
    taxCodes.data.TICs.forEach((code) => {
      Reaction.Importer.object(TaxCodes, { taxCode: code.TICID, shopId: Reaction.getShopId(), taxCodeProvider: "taxes-taxcloud" }, buildTaxCode(child.tic));
    });
  }
});
