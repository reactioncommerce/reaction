import gql from "graphql-tag";
import { navigationTreeWith10LevelsFragment } from "./fragments";

export default gql`
  query defaultNavigationTreeQuery($id: ID!, $language: String!) {
    navigationTreeById(id: $id, language: $language) {
      ...NavigationTreeWith10Levels
    }
  }

  ${navigationTreeWith10LevelsFragment}
`;
