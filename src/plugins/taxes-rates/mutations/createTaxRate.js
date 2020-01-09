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
  const { appEvents, collections } = context;
  const { Taxes } = collections;

  await context.validatePermissions("reaction:legacy:taxRates", "create", { shopId, legacyRoles: ["owner", "admin"] });

  const taxRate = {
    _id: Random.id(),
    shopId,
    country,
    region,
    postal,
    taxCode,
    taxLocale: "destination",
    rate
  };

  await Taxes.insertOne(taxRate);

  await appEvents.emit("afterTaxRateCreate", taxRate);

  return taxRate;
}
