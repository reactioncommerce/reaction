import gql from "graphql-tag";

export default gql`
  query catalogItemProductQuery($slugOrId: String!) {
    catalogItemProduct(slugOrId: $slugOrId) {
      product {
        _id
        productId
        title
        pageTitle
        slug
        description
        vendor
        isLowQuantity
        isSoldOut
        isBackorder
        metafields {
          key
          value
        }
        pricing {
          currency {
            code
          }
          displayPrice
          minPrice
          maxPrice
        }
        shop {
          currency {
            code
          }
        }
        primaryImage {
          URLs {
            large
            medium
            original
            small
            thumbnail
          }
          toGrid
          priority
          productId
          variantId
        }
        media {
          toGrid
          priority
          productId
          variantId
          URLs {
            thumbnail
            small
            medium
            large
            original
          }
        }
        tags {
          nodes {
            name
            slug
            position
          }
        }
        variants {
          _id
          variantId
          title
          optionTitle
          index
          pricing {
            price
            currency {
              code
            }
            displayPrice
          }
          options {
            _id
            variantId
            title
            index
            pricing {
              price
              currency {
                code
              }
              displayPrice
            }
            optionTitle
            isSoldOut
            isLowQuantity
            media {
              toGrid
              priority
              productId
              variantId
              URLs {
                thumbnail
                small
                medium
                large
                original
              }
            }
            primaryImage {
              URLs {
                large
                medium
                original
                small
                thumbnail
              }
              toGrid
              priority
              productId
              variantId
            }
          }
          media {
            toGrid
            priority
            productId
            variantId
            URLs {
              thumbnail
              small
              medium
              large
              original
            }
          }
          primaryImage {
            URLs {
              large
              medium
              original
              small
              thumbnail
            }
            toGrid
            priority
            productId
            variantId
          }
        }
      }
    }
  }
`;
