/**
 * @summary return a possibly filtered list of locations
 * @param {Object} context - The application context
 * @param {String} shopId - The shopId to query for
 * @param {Object} filter - optional filter parameters
 * @return {Promise<Array<Location>>} - A list of locations
 */
export default async function locations(context, shopId, filter) {
  const { collections: { Locations } } = context;

  const selector = { shopId };

  if (filter) {
    const { name, identifier, type, phone, fulfillmentMethod, localFulfillmentOnly, enabled, isArchived } = filter;

    if (name) {
      selector.name = name;
    }

    if (identifier) {
      selector.identifier = identifier;
    }

    if (type) {
      selector.type = type;
    }

    if (phone) {
      selector.code = phone;
    }

    if (fulfillmentMethod) {
      selector.fulfillmentMethod = fulfillmentMethod;
    }

    if (localFulfillmentOnly) {
      selector.localFulfillmentOnly = localFulfillmentOnly;
    }

    if (typeof enabled === "boolean") {
      selector.enabled = enabled;
    }

    if (typeof isArchived === "boolean") {
      if (isArchived) {
        selector.isArchived = true;
      } else {
        selector.isArchived = { $ne: true };
      }
    }
  }

  return Locations.find(selector);
}
