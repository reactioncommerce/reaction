import gql from "graphql-tag";

export default gql`
  query getTags($shopId: ID!, $isTopLevel: Boolean, $first: ConnectionLimitInt, $after: ConnectionCursor) {
    tags(shopId: $shopId, isTopLevel: $isTopLevel, first: $first, after: $after) {
      edges {
        cursor,
        node {
          _id,
          name,
          slug,
          heroMediaUrl,
          position,
          subTags (first: $first) {
            edges {
              cursor
              node {
                _id,
                name,
                slug,
                heroMediaUrl,
                position,
                subTags (first: $first) {
                    edges {
                    cursor
                    node {
                      _id,
                      name,
                      slug,
                      heroMediaUrl,
                      position,
                    } 
                  }
                  pageInfo {
                    endCursor,
                    startCursor,
                    hasNextPage,
                    hasPreviousPage,
                  }
                }
                
              }
            }
            pageInfo {
              endCursor,
              startCursor,
              hasNextPage,
              hasPreviousPage,
            }
          },
        }
      }
      pageInfo {
        endCursor,
        startCursor,
        hasNextPage,
        hasPreviousPage,
      }
    }
  }
`;
