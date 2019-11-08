import Random from "@reactioncommerce/random";

/**
 * @name Mutation.createTaxRate
 * @method
 * @memberof GraphQL/tax-rates
 * @summary Add a tax rate
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} AddTaxRatePayload
 */
export default async function createTaxRate(context, input) {
  // Check for owner or admin permissions from the user before allowing the mutation
  const { shopId, country, region, postal, taxCode, rate } = input;
  const { appEvents, checkPermissions, collections } = context;
  const { TaxRates } = collections;

  await checkPermissions(["admin", "owner"], shopId);

  const taxRate = {
    _id: Random.id(),
    shopId,
    country,
    region,
    postal,
    taxCode,
    rate
  };

  await TaxRates.insertOne(taxRate);

  await appEvents.emit("afterTagRateCreate", taxRate);

  return taxRate;
}
