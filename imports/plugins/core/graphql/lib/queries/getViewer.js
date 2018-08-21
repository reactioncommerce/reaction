import gql from "graphql-tag";

export default gql`
  query viewerQuery {
    viewer {
      _id,
      currency {
        _id, 
        code
        symbol,
        format,
        scale,
        decimal,
        thousand,
        rate
      }
    }
  }
`;
