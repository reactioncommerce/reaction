import gql from "graphql-tag";

export default gql`
  mutation generateSitemaps($nothing: String) {
    generateSitemaps(nothing: $nothing)
  }
`;
