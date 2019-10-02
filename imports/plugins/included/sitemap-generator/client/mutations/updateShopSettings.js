import gql from "graphql-tag";

export default gql`
  mutation updateShopSettings($input: UpdateShopSettingsInput!) {
    updateShopSettings(input: $input) {
      shopSettings {
        sitemapRefreshPeriod
      }
    }
  }
`;
