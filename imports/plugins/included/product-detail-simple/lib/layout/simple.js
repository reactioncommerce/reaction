
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
          component: "ProductField",
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
          component: "ProductField",
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
      size: "half",
      permissions: ["admin"],
      audience: ["guest", "anonymous"],
      style: {
        "@media  only screen and (max-width: 921px)": {
          minWidth: "100%",
          maxWidth: "100%"
        }
      },
      children: [
        // Media Gallery
        {
          component: "MediaGalleryContainer"
        },

        // Tags
        {
          component: "ProductTags"
        },

        // Metadata
        {
          component: "ProductMetadata"
        }
      ]
    },

    // Variant block
    {
      type: "block",
      columns: 6,
      size: "half",
      permissions: ["admin"],
      audience: ["guest", "anonymous"],
      style: {
        "@media  only screen and (max-width: 921px)": {
          minWidth: "100%",
          maxWidth: "100%"
        }
      },
      children: [
        // Price /  Social Buttons split
        {
          axis: "horizontal",
          align: "center",
          type: "block",
          size: "static variable",
          permissions: ["createProduct"],
          audience: ["guest", "anonymous"],
          style: {
            padding: 0
          },
          children: [
            // Price Range
            {
              type: "block",
              size: "variable",
              style: {
                padding: 0
              },
              children: [
                {
                  component: "PriceRange"
                }
              ]
            },
            // Social Buttons
            {
              type: "block",
              size: "static",
              justify: "end",
              style: {
                padding: 0
              },
              children: [
                {
                  component: "SocialContainer"
                }
              ]
            }
          ]
        },

        // Vendor
        {
          component: "ProductField",
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
          component: "ProductField",
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
          component: "VariantListContainer"
        },

        // Divider
        {
          component: "Divider"
        },

        // Alerts for checkout
        {
          component: "AlertContainer",
          props: {
            placement: "productDetail"
          }
        },

        // Add to cart button
        {
          component: "AddToCartButton",
          props: {
            style: {
              paddingTop: 20
            }
          }
        }

      ]
    }
  ];
}
