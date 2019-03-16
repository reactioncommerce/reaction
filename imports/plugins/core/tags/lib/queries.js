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

export const tagProductsQueryString = `
  query getTagProducts($shopId: ID!, $first: ConnectionLimitInt, $tagId: ID!, $last:  ConnectionLimitInt, $before: ConnectionCursor, $after: ConnectionCursor) {
    productsByTagId(shopId: $shopId, tagId: $tagId, first: $first, last: $last, before: $before, after: $after) {
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      nodes {
        _id
        title
        position
      }
    }
  }
`;

export const tagProductsQuery = gql`${tagProductsQueryString}`;
