import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
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
      shopId,
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

Meteor.methods({
  "taxes/insertTaxCodes": taxCodes.populateTaxCodes
});
