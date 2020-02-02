/**
 * @name Mutation.editTaxRate
 * @method
 * @memberof GraphQL/tax-rates
 * @summary Update a tax rate
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} UpdateTaxRatePayload
 */
export default async function updateTaxRate(context, input) {
  const {
    _id,
    country,
    postal,
    rate,
    region,
    shopId,
    sourcing: taxLocale,
    taxCode
  } = input;
  const { appEvents, collections } = context;
  const { Taxes } = collections;

  await context.validatePermissions("reaction:legacy:taxRates", "update", { shopId });

  const updates = {
    country,
    region,
    postal,
    taxCode,
    rate
  };
  if (taxLocale) {
    updates.taxLocale = taxLocale;
  }

  await Taxes.updateOne({
    _id,
    shopId
  }, {
    $set: updates
  });

  const taxRate = await Taxes.findOne({ _id });

  await appEvents.emit("afterTaxRateUpdate", taxRate);

  return taxRate;
}
