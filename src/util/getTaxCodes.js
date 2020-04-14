/**
 * @param {Object} context App context
 * @param {String} shopId Shop to get tax codes for
 * @returns {Object[]} Array of tax codes
 */
export default async function getTaxCodes() {
  return [{
    code: "RC_TAX",
    label: "Taxable (RC_TAX)"
  }];
}
