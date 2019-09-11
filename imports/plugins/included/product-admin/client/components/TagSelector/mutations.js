import gql from "graphql-tag";

export const ADD_TAGS_TO_PRODUCTS = gql`
  mutation addTagsToProducts($input: ProductTagsOperationInput!) {
    addTagsToProducts(input: $input) {
      foundCount
      notFoundCount
      updatedCount
      writeErrors {
        documentId
        errorMsg
      }
    }
  }
`;

export const REMOVE_TAGS_FROM_PRODUCTS = gql`
  mutation removeTagsFromProducts($input: ProductTagsOperationInput!) {
    removeTagsFromProducts(input: $input) {
      foundCount
      notFoundCount
      updatedCount
      writeErrors {
        documentId
        errorMsg
      }
    }
  }
`;
