import gql from "graphql-tag";

export const navigationItemFragment = {
  navigationItem: gql`
    fragment NavigationItemCommon on NavigationItem {
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
  `
};
