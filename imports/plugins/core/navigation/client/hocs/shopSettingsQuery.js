import gql from "graphql-tag";

export default gql`
  query shopSettingsQuery($shopId: ID!) {
    shopSettings(shopId: $shopId) {
      shouldNavigationTreeItemsBeAdminOnly
      shouldNavigationTreeItemsBePubliclyVisible
      shouldNavigationTreeItemsBeSecondaryNavOnly
    }
  }
`;
