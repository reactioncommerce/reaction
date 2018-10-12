import gql from "graphql-tag";

export default gql`
  mutation generateSitemaps($input: GenerateSitemapsInput) {
    generateSitemaps(input: $input) {
      wasJobScheduled
    }
  }
`;
