import gql from "graphql-tag";

export const addTagMutation = gql`
  mutation addTagMutation($input: AddTagInput!) {
    addTag(input: $input) {
      tag {
        _id
        name
        displayTitle
      }
    }
  }
`;

export const updateTagMutation = gql`
  mutation updateTagMutation($input: UpdateTagInput!) {
    updateTag(input: $input) {
      tag {
        _id
        name
        displayTitle
      }
    }
  }
`;

export const removeTagRuleMutation = gql`
  mutation removeTagMutation($input: RemoveTagInput!) {
    removeTag(input: $input) {
      tag {
        _id
        name
        displayTitle
      }
    }
  }
`;
