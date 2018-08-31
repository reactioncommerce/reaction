import gql from "graphql-tag";

export default gql`
  mutation updateCartItemsQuantity($input: UpdateCartItemsQuantityInput!) {
    updateCartItemsQuantity(input: $input) {
      cart {
        _id
        account {
          _id
        }
        createdAt
        shop {
          _id
        }
        updatedAt
        expiresAt
        items {
          nodes {
            _id
            productConfiguration {
              productId
              productVariantId
            }
            addedAt
            attributes {
              label
              value
            }
            createdAt
            isBackorder
            isLowQuantity
            isSoldOut
            imageURLs {
              large
              small
              original
              medium
              thumbnail
            }
            metafields {
              value
              key
            }
            parcel {
              length
              width
              weight
              height
            }
            price {
              amount
              displayAmount
              currency {
                code
              }
            }
            priceWhenAdded {
              amount
              displayAmount
              currency {
                code
              }
            }
            productSlug
            productType
            quantity
            shop {
              _id
            }
            title
            variantTitle
            optionTitle
            updatedAt
          }
        }
      }
      clientMutationId
    }
  }
`;
