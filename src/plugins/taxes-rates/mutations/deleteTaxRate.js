/**
 * @name mutation.deleteTaxRate
 * @method
 * @memberof GraphQL/tax-rates
 * @summary Delete a tax rate
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} DeleteTaxRatePayload
 */
export default async function deleteTaxRate(context, input) {
  // Check for owner or admin permissions from the user before allowing the mutation
  const { shopId, _id } = input;
  const { appEvents, checkPermissions, collections } = context;
  const { TaxRates } = collections;

  await checkPermissions(["admin", "owner"], shopId);

  const taxRateToDelete = await TaxRates.find({ _id });

  await TaxRates.remove({
    _id,
    shopId
  });

  await appEvents.emit("afterTagRateDelete", taxRateToDelete);

  return taxRateToDelete;
}
