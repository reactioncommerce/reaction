import gql from "graphql-tag";

export default gql`
  query viewerQuery {
    viewer {
      _id,
      name,
      emailRecords {
        provides
        address
        verified
      },
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
