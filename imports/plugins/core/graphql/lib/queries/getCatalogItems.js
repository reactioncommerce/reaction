import gql from "graphql-tag";

export default gql`
  query getCatalogItems($shopId: ID!, $tagIds: [ID], $currencyCode: String!, $first: ConnectionLimitInt, $last:  ConnectionLimitInt,
    $before: ConnectionCursor, $after: ConnectionCursor, $sortBy: CatalogItemSortByField,
    $sortByPriceCurrencyCode: String, $sortOrder: SortOrder) {
    catalogItems(shopIds: [$shopId], tagIds: $tagIds, first: $first, last: $last, before: $before, after: $after,
      sortBy: $sortBy, sortByPriceCurrencyCode: $sortByPriceCurrencyCode, sortOrder: $sortOrder) {
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
                currencyExchangePricing(currencyCode: $currencyCode) {
                  currency {
                    code
                  }
                  displayPrice
                  minPrice
                  maxPrice
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
