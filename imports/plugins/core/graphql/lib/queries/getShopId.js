import gql from "graphql-tag";

export default gql`
  query getShopId($slug: String!) {
    shopBySlug(slug: $slug) {
      _id
    }
  }
`;
