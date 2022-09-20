/**
 * @name xformSurchargeAmount
 * @summary Transforms amount from Float to Money type
 * @param {Object} context An object with request-specific state
 * @param {String} shopId ID of shop
 * @param {String} importedAmount amount to convert to Money type
 * @returns {Object} Transformed amount
 */
export default async function xformSurchargeAmount(context, shopId, importedAmount) {
  const shop = await context.collections.Shops.findOne({ _id: shopId });
  const { currency: currencyCode } = shop;

  return {
    amount: importedAmount,
    currencyCode
  };
}
