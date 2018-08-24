import gql from "graphql-tag";

export default gql`
  query getShop($id: ID!) {
    shop(id: $id) {
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
