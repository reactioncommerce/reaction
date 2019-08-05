import gql from "graphql-tag";
import { navigationItemFragment } from "./fragments";

export default gql`
  query navigationItemsQuery($shopId: ID!, $first: ConnectionLimitInt, $after: ConnectionCursor) {
    navigationItemsByShopId(shopId: $shopId, first: $first, after: $after) {
      totalCount
      nodes {
        ...NavigationItem
      }
    }
  }
  ${navigationItemFragment}
`;
