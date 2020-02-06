import ReactionError from "@reactioncommerce/reaction-error";

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
  const { shopId, _id } = input;
  const { appEvents, collections } = context;
  const { Taxes } = collections;

  await context.validatePermissions("reaction:legacy:taxRates", "delete", { shopId });

  const { ok, value: deletedTaxRate } = await Taxes.findOneAndDelete({
    _id,
    shopId
  });
  if (ok !== 1) throw new ReactionError("not-found", "Not found");

  await appEvents.emit("afterTaxRateDelete", deletedTaxRate);

  return deletedTaxRate;
}
