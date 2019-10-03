import gql from "graphql-tag";

export default gql`
  query shopSettings($shopId: ID!) {
    shopSettings(shopId: $shopId) {
      sitemapRefreshPeriod
    }
  }
`;
