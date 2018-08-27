import gql from "graphql-tag";

export default gql`
  query getShop($shopId: ID!) {
    shop(id: $shopId) {
      _id,
      description,
      name,
      languages {
        label
        enabled
        i18n
      },
      language,
      currency {
        _id, 
        code
        symbol,
        format,
        scale,
        decimal,
        thousand,
        rate,
        enabled
      },
      currencies {
        _id, 
        code
        symbol,
        format,
        scale,
        decimal,
        thousand,
        rate,
        enabled
      }
    }
  }
`;
