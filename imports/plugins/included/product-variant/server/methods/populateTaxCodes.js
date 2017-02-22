import { Meteor } from "meteor/meteor";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";

const taxCodes = {};

/*
 * products/updateProductField
 * @summary update single product or variant field
 * @param {String} shopID - current shop's id
 * @param {Object} code - tax code object to insert into TaxCodes collection
 * @param {String} providerName - tax code provider
 * latest changes. its used for products and variants
 * @return {} undefined
 */
taxCodes.populateTaxCodes = function (shopId, code, providerName) {
  check(shopId, String);
  check(code, Object);
  check(providerName, String);

  try {
    TaxCodes.insert({
      id: code.id,
      shopId: shopId,
      taxCode: code.taxCode,
      taxCodeProvider: providerName,
      ssuta: code.isSSTCertified,
      label: code.description,
      parent: code.parentTaxCode
    });
  } catch (e) {
    throw e;
  }
};

Meteor.methods({
  "taxes/insertTaxCodes": taxCodes.populateTaxCodes
});
