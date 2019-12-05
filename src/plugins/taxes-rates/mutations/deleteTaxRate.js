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
  const { appEvents, collections } = context;
  const { TaxRates } = collections;

  await context.validatePermissions("reaction:taxRates", "delete", { shopId, legacyRoles: ["owner", "admin"] });

  const taxRateToDelete = await TaxRates.findOne({
    _id,
    shopId
  });

  await TaxRates.removeOne({
    _id,
    shopId
  });

  await appEvents.emit("afterTaxRateDelete", taxRateToDelete);

  return taxRateToDelete;
}
