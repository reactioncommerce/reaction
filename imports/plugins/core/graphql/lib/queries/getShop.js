import gql from "graphql-tag";

export default gql`
  query getShop($id: ID!) {
    shop(id: $id) {
      _id
      brandAssets {
        navbarBrandImageId
      }
      language
      name
      shopLogoUrls {
        primaryShopLogoUrl
      }
      storefrontUrls {
        storefrontHomeUrl
        storefrontLoginUrl
        storefrontOrderUrl
        storefrontOrdersUrl
        storefrontAccountProfileUrl
      }
    }
  }
`;
