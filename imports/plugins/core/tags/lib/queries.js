import gql from "graphql-tag";
import { Tag } from "./fragments";

export const tagListingQuery = gql`
  query getTags($shopId: ID!, $first: ConnectionLimitInt, $last:  ConnectionLimitInt, $before: ConnectionCursor, $after: ConnectionCursor) {
    tags(shopId: $shopId, first: $first, last: $last, before: $before, after: $after, shouldIncludeInvisible: true) {
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      nodes {
        ${Tag}
      }
    }
  }
`;

export const getTag = gql`
  query getTag($slugOrId: String!) {
    tag(slugOrId: $slugOrId, shouldIncludeInvisible: true) {
      ${Tag}
    }
  }
`;

export const tagProductsQuery = gql`
  query getTagProducts($shopId: ID!, $tagId: ID!) {
    productsByTagId(shopId: $shopId, tagId: $tagId) {
      pageInfo {
        endCursor
        startCursor
        hasNextPage
      }
      nodes {
        _id
        title
        position
      }
    }
  }
`;
