import gql from "graphql-tag";

export const GET_PRIMARY_SHOP_ID = gql`
  query getPrimaryShopId {
    primaryShopId
  }
`;

export const GET_TAGS = gql`
  query Tags($shopId: ID!, $filter: String) {
    tags(shopId: $shopId, filter: $filter) {
      edges {
        node {
          _id
          name
        }
      }
    }
  }
`;
