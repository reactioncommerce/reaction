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
      permissions: ["admin"], // Permissions for staff
      audience: ["guest", "anonymous"], // Permissions for customers
      children: [
        // Title
        {
          component: ProductField,
          // Example, you can set permissions components that are children of a block
          permissions: ["admin"],
          audience: ["guest", "anonymous"],
          props: {
            fieldName: "title",
            fieldTitle: "Title",
            element: "h1",
            textFieldProps: {
              i18nKeyPlaceholder: "productDetailEdit.title",
              placeholder: "Title"
            }
          }
        },

        // PageTitle
        {
          component: ProductField,
          permissions: ["admin"],
          audience: ["guest", "anonymous"],
          props: {
            // editable: this.editable,
            fieldName: "pageTitle",
            fieldTitle: "SubTitle",
            element: "h2",
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
      permissions: ["admin"],
      audience: ["guest", "anonymous"],
      children: [
        // Media Gallery
        {
          component: MediaGalleryContainer
        },

        // Tags
        {
          component: ProductTags
        },

        // Metadata
        {
          component: ProductMetadata
        }
      ]
    },

    // Variant block
    {
      type: "block",
      columns: 6,
      permissions: ["admin"],
      audience: ["guest", "anonymous"],
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
                  component: PriceRange
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
            fieldName: "vendor",
            fieldTitle: "Vendor",
            textFieldProps: {
              i18nKeyPlaceholder: "productDetailEdit.vendor",
              placeholder: "Vendor"
            }
          }
        },
        {
          component: ProductField,
          props: {
            fieldName: "description",
            fieldTitle: "Description",
            multiline: true,
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
            placement: "productDetail"
          }
        },

        // Add to cart button
        {
          component: AddToCartButton
        }

      ]
    }
  ];
}
