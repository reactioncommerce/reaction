import gql from "graphql-tag";

export default gql`
  query getTagId($slugOrId: String!) {
    tag(slugOrId: $slugOrId) {
      _id
    }
  }
`;
