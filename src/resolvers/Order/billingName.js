/**
 * @name Order/billingName
 * @method
 * @memberof Order/GraphQL
 * @summary Returns a string of comma separated full names involved with payment
 * @param {Object} order - Result of the parent resolver, which is a Order object in GraphQL schema format
 * @returns {String} A string of names
 */
export default async function billingName(order) {
  if (!Array.isArray(order.payments)) return null;
  let name = "";
  order.payments.forEach((payment) => {
    name = name.concat(`${payment.address.fullName}, `);
  });
  // remove the last comma and whitespace
  return name.replace(/,\s*$/, "");
}
