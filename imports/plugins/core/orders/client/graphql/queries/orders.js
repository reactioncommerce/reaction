import gql from "graphql-tag";

export default gql`
query ordersQuery($shopIds: [ID], $filters: OrderFilterInput, $first: ConnectionLimitInt, $offset: Int) {
  orders(shopIds: $shopIds, filters: $filters, first: $first, offset: $offset) {
    nodes {
      _id
      referenceId
      createdAt
      email
      payments {
        billingAddress {
          fullName
        }
        amount { 
          displayAmount
        }
        status
      }
      fulfillmentGroups {
        status
      }
      email
      status
    }
    totalCount
  }
}
`;
