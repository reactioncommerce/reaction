/**
 * @name xformSurchargeAmount
 * @summary Transforms amount from Float to Money type
 * @param {String} importedAmount amount to convert to Money type
 * @return {Object} Transformed amount
 */
export default async function xformSurchargeAmount(context, shopId, importedAmount) {
  const shop = await context.collections.Shops.findOne({ _id: shopId });
  const { currency: currencyCode } = shop;

  return {
    amount: importedAmount,
    currencyCode
  };
}
