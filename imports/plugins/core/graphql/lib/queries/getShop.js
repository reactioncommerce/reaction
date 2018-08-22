import gql from "graphql-tag";

export default gql`
  query shopQuery($shopId: ID!) {
    shop(id: $shopId) {
      _id
      description
      name
      currency {
        code
      }
    }
  }
`;
