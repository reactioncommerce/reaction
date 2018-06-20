import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Reaction } from "server/api";
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
    const TAXCODE_SRC = "https://taxcloud.net/tic/?format=json";
    const taxCodes = HTTP.get(TAXCODE_SRC);

    if (!taxCodes) {
      throw new Meteor.Error("retrieval-failed", "Error getting tax codes");
    }
    taxCodes.data.tic_list.forEach((code) => {
      if (code.tic.children) {
        code.tic.children.forEach((child) => {
          Reaction.Importer.object(TaxCodes, { taxCode: child.tic.id, shopId: Reaction.getShopId(), taxCodeProvider: "taxes-taxcloud" }, buildTaxCode(child.tic));
        });
      }
      Reaction.Importer.object(TaxCodes, { taxCode: code.tic.id, shopId: Reaction.getShopId(), taxCodeProvider: "taxes-taxcloud" }, buildTaxCode(code.tic));
    });
  }
});
