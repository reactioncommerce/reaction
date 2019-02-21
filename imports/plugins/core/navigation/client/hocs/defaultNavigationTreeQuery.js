import gql from "graphql-tag";
import { navigationItemFragment } from "./fragments";

export default gql`
  query defaultNavigationTreeQuery($id: ID!, $language: String!) {
    navigationTreeById(id: $id, language: $language) {
      name
      draftItems {
        expanded
        navigationItem {
          ...NavigationItemCommon
        }
        items {
          expanded
          navigationItem {
            ...NavigationItemCommon
          }
          items {
            navigationItem {
              ...NavigationItemCommon
            }
          }
        }
      }
    }
  }
  ${navigationItemFragment.navigationItem}
`;
