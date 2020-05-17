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
  const {
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

  await context.validatePermissions("reaction:legacy:taxRates", "create", { shopId });

  const taxRate = {
    _id: Random.id(),
    country,
    postal,
    rate,
    region,
    shopId,
    taxCode,
    taxLocale
  };

  await Taxes.insertOne(taxRate);

  await appEvents.emit("afterTaxRateCreate", taxRate);

  return taxRate;
}
