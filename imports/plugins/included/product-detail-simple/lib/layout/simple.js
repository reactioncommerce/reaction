import React from "react";
import {
  AddToCartButton,
  ProductMetadata,
  ProductTags,
  ProductField,
  PriceRange
} from "../../client/components";
import {
  SocialContainer,
  VariantListContainer
} from "../../client/containers";
import { AlertContainer } from "/imports/plugins/core/ui/client/containers";
import { MediaGalleryContainer } from "/imports/plugins/core/ui/client/containers";

export default function blocks() {
  return [

    // Header block (Full Width)
    {
      type: "block",
      columns: 12,
      element: "header",
      className: "pdp header",
      permissions: ["admin"],
      audience: ["guest", "anonymous"],
      children: [
        // Title
        {
          component: ProductField,
          props: {
            editable: this.editable,
            fieldName: "title",
            fieldTitle: "Title",
            element: "h1",
            onProductFieldChange: this.onProductFieldChange,
            product: this.product,
            textFieldProps: {
              i18nKeyPlaceholder: "productDetailEdit.title",
              placeholder: "Title"
            }
          }
        },

        // PageTitle
        {
          component: ProductField,
          props: {
            editable: this.editable,
            fieldName: "pageTitle",
            fieldTitle: "SubTitle",
            element: "h2",
            onProductFieldChange: this.onProductFieldChange,
            product: this.product,
            textFieldProps: {
              i18nKeyPlaceholder: "productDetailEdit.pageTitle",
              placeholder: "Subtitle"
            }
          }
        }
      ]
    },

    // Media block
    // Contains
    // - Medai Gallery
    // - Tags
    // - Details
    {
      type: "block",
      columns: 6,
      children: [
        // Media Gallery
        {
          component: MediaGalleryContainer,
          props: {
            media: this.props.media
          }
        },

        // Tags
        {
          component: ProductTags,
          props: {
            editable: this.editable,
            product: this.product,
            tags: this.tags
          }
        },

        // Metadata
        {
          component: ProductMetadata,
          props: {
            product: this.product
          }
        }
      ]
    },

    // Variant block
    {
      type: "block",
      columns: 6,
      children: [
        // Price /  Social Buttons split
        {
          type: "block",
          style: {
            display: "flex"
          },
          permissions: ["createProduct"],
          audience: ["guest", "anonymous"],
          children: [
            // Price Range
            {
              type: "block",
              style: {
                flex: 1
              },
              children: [
                {
                  component: PriceRange,
                  props: {
                    amount: this.props.priceRange
                  }
                }
              ]
            },
            // Social Buttons
            {
              type: "block",
              style: {
                display: "flex",
                flex: 1,
                justifyContent: "flex-end"
              },
              children: [
                {
                  component: SocialContainer
                }
              ]
            }
          ]
        },

        // Vendor
        {
          component: ProductField,
          props: {
            editable: this.editable,
            fieldName: "vendor",
            fieldTitle: "Vendor",
            onProductFieldChange: this.onProductFieldChange,
            product: this.product,
            textFieldProps: {
              i18nKeyPlaceholder: "productDetailEdit.vendor",
              placeholder: "Vendor"
            }
          }
        },
        {
          component: ProductField,
          props: {
            editable: this.editable,
            fieldName: "description",
            fieldTitle: "Description",
            multiline: true,
            onProductFieldChange: this.onProductFieldChange,
            product: this.product,
            textFieldProps: {
              i18nKeyPlaceholder: "productDetailEdit.description",
              placeholder: "Description"
            }
          }
        },

        // Variant List
        {
          component: VariantListContainer
        },

        // Alerts for checkout
        {
          component: AlertContainer,
          props: {
            placement: "ProductDetail"
          }
        },

        // Add to cart button
        {
          component: AddToCartButton,
          props: {
            cartQuantity: this.props.cartQuantity,
            onCartQuantityChange: this.props.onCartQuantityChange,
            onClick: this.props.onAddToCart
          }
        }

      ]
    }
  ];
}
