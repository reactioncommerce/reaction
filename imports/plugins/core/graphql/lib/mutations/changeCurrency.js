import gql from "graphql-tag";

export default gql`
  mutation setAccountProfileCurrency($input: SetAccountProfileCurrencyInput!) {
    setAccountProfileCurrency(input: $input) {
      account {
        _id
      },
      clientMutationId
    }
  }
`;