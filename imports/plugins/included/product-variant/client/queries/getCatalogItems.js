import gql from "graphql-tag";

export default getCatalogItems = gql`
  query catalogItemsQuery($shopId: ID!, $tagIds: [ID] $first: ConnectionLimitInt, $last:  ConnectionLimitInt, $before: ConnectionCursor, $after: ConnectionCursor, $sortBy: CatalogItemSortByField, $sortByPriceCurrencyCode: String, $sortOrder: SortOrder) {
    catalogItems(shopIds: [$shopId], tagIds: $tagIds, first: $first, last: $last, before: $before, after: $after, sortBy: $sortBy, sortByPriceCurrencyCode: $sortByPriceCurrencyCode, sortOrder: $sortOrder) {
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          _id
          ... on CatalogItemProduct {
            product {
              _id
              title
              slug
              description
              vendor
              isLowQuantity
              isSoldOut
              isBackorder
              shop {
                currency {
                  code
                }
              }
              pricing {
                currency {
                  code
                }
                displayPrice
                minPrice
                maxPrice
              }
              primaryImage {
                URLs {
                  thumbnail
                  small
                  medium
                  large
                }
              }
            }
          }
        }
      }
    }
  }
`;
