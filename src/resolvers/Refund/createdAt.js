/**
 * @name Refund/amount
 * @method
 * @memberof Order/GraphQL
 * @summary converts the `createdAt` prop from a unix timestring to a format readable by `graphql-iso-data`
 * @param {Object} refund - result of the parent resolver, which is a refund object in GraphQL schema format
 * @returns {String} A datetime string
 */
export default function createdAt(refund) {
  // graphql-iso-data won't accept a Unix timestamp in ms,
  // so we need to convert it to a readable format
  const formattedDate = new Date(refund.created);

  return formattedDate;
}
