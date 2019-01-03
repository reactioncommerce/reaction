import gql from "graphql-tag";

export const tagListingQuery = gql`
  fragment TagInfo on Tag {
    position
    name
    slug
    # isVisible
    metafields {
      description
      key
      namespace
      scope
      value
      valueType
    }
  }

  query getTags($shopId: ID!, $first: ConnectionLimitInt, $last:  ConnectionLimitInt, $before: ConnectionCursor, $after: ConnectionCursor) {
    tags(shopId: $shopId, first: $first, last: $last, before: $before, after: $after) {
      pageInfo {
        endCursor
        startCursor
        hasNextPage
      }
      nodes {
        ...TagInfo
      }
    }
  }
`;
