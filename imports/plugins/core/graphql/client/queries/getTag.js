import gql from "graphql-tag";

export default getTag = gql`
  query getTag($slugOrId: String!) {
    tag(slugOrId: $slugOrId) {
      _id
    }
  }
`;
