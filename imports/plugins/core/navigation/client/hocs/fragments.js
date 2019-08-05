import gql from "graphql-tag";


export const navigationItemFragment = gql`
  fragment NavigationItem on NavigationItem {
    _id
    draftData {
      content {
        language
        value
      }
      url
      isUrlRelative
      shouldOpenInNewWindow
      classNames
    }
    metadata
  }
`;

export const navigationTreeItemFragment = gql`
  fragment NavigationTreeItem on NavigationTreeItem {
    expanded
    isVisible
    isPrivate
    isSecondary
    navigationItem {
      ...NavigationItem
    }
  }
  ${navigationItemFragment}
`;

export const navigationTreeWith10LevelsFragment = gql`
  fragment NavigationTreeWith10Levels on NavigationTree {
    name
    draftItems {
      ...NavigationTreeItem
      items {
        ...NavigationTreeItem
        items {
          ...NavigationTreeItem
          items {
            ...NavigationTreeItem
            items {
              ...NavigationTreeItem
              items {
                ...NavigationTreeItem
                items {
                  ...NavigationTreeItem
                  items {
                    ...NavigationTreeItem
                    items {
                      ...NavigationTreeItem
                      items {
                        navigationItem {
                          ...NavigationItem
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ${navigationItemFragment}
  ${navigationTreeItemFragment}
`;
