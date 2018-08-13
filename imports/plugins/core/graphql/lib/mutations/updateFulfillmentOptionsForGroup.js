import gql from "graphql-tag";

export default gql`
  mutation updateFulfillmentOptionsForGroup($input: UpdateFulfillmentOptionsForGroupInput!) {
    updateFulfillmentOptionsForGroup(input: $input) {
      cart {
        _id
      }
    }
  }
`;
