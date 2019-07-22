import moment from "moment";

/**
 * @name Refund/amount
 * @method
 * @memberof Order/GraphQL
 * @summary converts the `createdAt` prop from a unix timestring to a format readable by `graphql-iso-data`
 * @param {Object} refund - result of the parent resolver, which is a refund object in GraphQL schema format
 * @return {String} A datetime string
 */
export default function createdAt(refund) {
  // graphql-iso-data won't accept the Unix timestamp that is provided by Stripe
  // we need to use moment to convert it to a readable format
  const formattedDate = moment(refund.created).format();

  return formattedDate;
}
