import gql from "graphql-tag";

export default gql`
  query viewerQuery {
    viewer {
      _id
    }
  }
`;
