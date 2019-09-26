import gql from "graphql-tag";

export default gql`
query ordersQuery($shopIds: [ID], $first: ConnectionLimitInt, $offset: Int) {
  orders(shopIds: $shopIds, first: $first, offset: $offset) {
    nodes {
      referenceId
      email
      status
    }
    totalCount
  }
}
`;
