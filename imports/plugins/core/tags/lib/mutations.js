import gql from "graphql-tag";
import { Tag } from "./fragments";

export const addTagMutation = gql`
  mutation addTagMutation($input: AddTagInput!) {
    addTag(input: $input) {
      tag {
        ${Tag}
      }
    }
  }
`;

export const setTagHeroMediaMutation = gql`
  mutation setTagHeroMediaMutation($input: SetTagHeroMediaInput!) {
    setTagHeroMedia(input: $input) {
      tag {
        ${Tag}
      }
    }
  }
`;

export const updateTagMutation = gql`
  mutation updateTagMutation($input: UpdateTagInput!) {
    updateTag(input: $input) {
      tag {
        ${Tag}
      }
    }
  }
`;

export const removeTagMutation = gql`
  mutation removeTagMutation($input: RemoveTagInput!) {
    removeTag(input: $input) {
      tag {
        ${Tag}
      }
    }
  }
`;
