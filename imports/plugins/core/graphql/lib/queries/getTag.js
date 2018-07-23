import gql from "graphql-tag";

export default gql`
  query getTag($slugOrId: String!) {
    tag(slugOrId: $slugOrId) {
      _id
    }
  }
`;
