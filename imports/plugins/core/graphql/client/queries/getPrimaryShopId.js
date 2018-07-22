import gql from "graphql-tag";

export default getPrimaryShopId = gql`
  query getPrimaryShopId {
    primaryShopId
  }
`;
