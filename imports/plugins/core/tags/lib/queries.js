import gql from "graphql-tag";
import { Tag } from "./fragments";

export const tagListingQuery = gql`
  query getTags($shopId: ID!, $first: ConnectionLimitInt, $last:  ConnectionLimitInt, $before: ConnectionCursor, $after: ConnectionCursor) {
    tags(shopId: $shopId, first: $first, last: $last, before: $before, after: $after) {
      pageInfo {
        endCursor
        startCursor
        hasNextPage
      }
      nodes {
        ${Tag}
      }
    }
  }
`;
