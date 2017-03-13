import { Meteor } from "meteor/meteor";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";

const taxCodes = {};

/*
 * taxes/insertTaxCodes
 * @summary populate TaxCodes collection
 * @param {String} shopID - current shop's id
 * @param {Object} code - tax code object to insert into TaxCodes collection
 * @param {String} providerName - tax code provider
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
      taxCode: code.taxCode || code.id,
      taxCodeProvider: providerName,
      ssuta: code.isSSTCertified,
      title: code.title || "",
      label: code.description || code.label,
      parent: code.parentTaxCode || code.parent,
      children: code.children || []
    });
  } catch (err) {
    throw new Meteor.Error("Error populating TaxCodes collection", err);
  }
};

/*
 * taxes/getTaxCodes
 * @summary fetch tax codes from TaxCodes collection
 * @param {String} shopID - current shop's id
 * @param {String} provider - tax code provider
 * @return {Array} array of tax codes
 */
taxCodes.fetchTaxCodes = function (shopId, provider) {
  check(shopId, String);
  check(provider, String);

  const taxCodesArray = [];

  const codes = TaxCodes.find({
    shopId: shopId,
    taxCodeProvider: provider
  });

  codes.forEach(function (code) {
    taxCodesArray.push({
      value: code.taxCode,
      label: `${code.taxCode} | ${code.label}`
    });
  });
  return taxCodesArray;
};

Meteor.methods({
  "taxes/insertTaxCodes": taxCodes.populateTaxCodes,
  "taxes/fetchTaxCodes": taxCodes.fetchTaxCodes
});
