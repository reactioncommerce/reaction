import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";
import { refreshJob } from "../jobs/taxcodes";

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
    id: code.ticid || code.id,
    taxCode: code.ticid || code.id,
    shopId: Reaction.getShopId(),
    taxCodeProvider: "taxes-taxcloud",
    ssuta: code.isSSUTA,
    parent: code.parentTic,
    title: code.description,
    label: code.label
  };
}

/**
 * @name getCodeMap
 * @summary returns a mapping of codeIds to codes.
 * @param {Array} code the list of tax-codes fetched
 * @param {Object} codeMap map of codeId: code
 * @returns {undefined} undefined
 */
function getCodeMap(code, codeMap) {
  if (!code || !code.ticid) {
    return;
  }
  if (code.children) {
    code.children.result.forEach((child) => {
      getCodeMap(child, codeMap);
    });
  }
  codeMap[code.ticid || code.id] = buildTaxCode(code);
  return;
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
    const TAXCODE_SRC = "https://core.taxcloud.com/api/tics";
    const taxCodes = HTTP.get(TAXCODE_SRC);

    if (!taxCodes) {
      throw new Meteor.Error("retrieval-failed", "Error getting tax codes");
    }
    const codeMap = {};
    taxCodes.data.result.forEach((code) => {
      getCodeMap(code, codeMap);
    });
    Object.keys(codeMap).forEach((codeId) => {
      const code = codeMap[codeId];
      Reaction.Importer.object(
        TaxCodes,
        {
          taxCode: `${code.taxCode}`,
          shopId: code.shopId,
          taxCodeProvider: code.taxCodeProvider
        },
        buildTaxCode(code)
      );
    });
  },

  /**
   * @method taxcloud/updateRefreshJob
   * @summary updates the refresh interval of the jobs
   * @returns {undefined}
   */
  "taxcloud/updateRefreshJob"() {
    refreshJob();
  }
});
