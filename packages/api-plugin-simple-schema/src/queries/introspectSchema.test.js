import SimpleSchema from "simpl-schema";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import introspectSchema from "./introspectSchema.js";

const Metafield = new SimpleSchema({
  key: {
    type: String,
    max: 30,
    optional: true
  },
  namespace: {
    type: String,
    max: 20,
    optional: true
  },
  scope: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  },
  valueType: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  }
});
const ShippingParcel = new SimpleSchema({
  containers: {
    type: String,
    optional: true
  },
  length: {
    type: Number,
    optional: true
  },
  width: {
    type: Number,
    optional: true
  },
  height: {
    type: Number,
    optional: true
  },
  weight: {
    type: Number,
    optional: true
  }
});
const Workflow = new SimpleSchema({
  "status": {
    type: String
  },
  "workflow": {
    type: Array,
    optional: true
  },
  "workflow.$": String
});
const productSchema = new SimpleSchema({
  "_id": {
    type: String,
    label: "Product ID"
  },
  "ancestors": {
    type: Array
  },
  "ancestors.$": {
    type: String
  },
  "createdAt": {
    type: Date
  },
  "currentProductHash": {
    type: String,
    optional: true
  },
  "description": {
    type: String,
    optional: true
  },
  "facebookMsg": {
    type: String,
    optional: true,
    max: 255
  },
  "googleplusMsg": {
    type: String,
    optional: true,
    max: 255
  },
  "handle": {
    type: String
  },
  "hashtags": {
    type: Array,
    optional: true
  },
  "hashtags.$": {
    type: String
  },
  "isDeleted": {
    type: Boolean
  },
  "isVisible": {
    type: Boolean
  },
  "metaDescription": {
    type: String,
    optional: true
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "originCountry": {
    type: String,
    optional: true
  },
  "pageTitle": {
    type: String,
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "pinterestMsg": {
    type: String,
    optional: true,
    max: 255
  },
  "productType": {
    type: String,
    optional: true
  },
  "publishedAt": {
    type: Date,
    optional: true
  },
  "publishedProductHash": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String
  },
  "shouldAppearInSitemap": {
    type: Boolean,
    optional: true
  },
  "supportedFulfillmentTypes": {
    type: Array
  },
  "supportedFulfillmentTypes.$": String,
  "template": {
    type: String,
    optional: true
  },
  "title": {
    type: String
  },
  "twitterMsg": {
    type: String,
    optional: true,
    max: 140
  },
  "type": {
    type: String
  },
  "updatedAt": {
    type: Date,
    optional: true
  },
  "vendor": {
    type: String,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true
  }
});
mockContext.simpleSchemas = {};
mockContext.simpleSchemas.Product = productSchema;

test("throws if schemaName is invalid", async () => {
  await expect(introspectSchema(mockContext, { shopId: "dSZqgQsyp48EpJzor", schemaName: "InvalidSchemaName" })).rejects.toThrowError("Invalid schema name");
});

test("introspect Product schema", async () => {
  const resultSchema = await introspectSchema(mockContext, { shopId: "dSZqgQsyp48EpJzor", schemaName: "Product" });
  const expectedSchema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      _id: {
        type: "string",
        path: "$._id"
      },
      ancestors: {
        type: "array",
        items: [
          {
            type: "string",
            path: "$.ancestors.[0]"
          }
        ],
        additionalItems: false,
        path: "$.ancestors"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        path: "$.createdAt"
      },
      currentProductHash: {
        type: "string",
        path: "$.currentProductHash"
      },
      description: {
        type: "string",
        path: "$.description"
      },
      facebookMsg: {
        type: "string",
        maxLength: 255,
        path: "$.facebookMsg"
      },
      googleplusMsg: {
        type: "string",
        maxLength: 255,
        path: "$.googleplusMsg"
      },
      handle: {
        type: "string",
        path: "$.handle"
      },
      hashtags: {
        type: "array",
        items: [
          {
            type: "string",
            path: "$.hashtags.[0]"
          }
        ],
        additionalItems: false,
        path: "$.hashtags"
      },
      isDeleted: {
        type: "boolean",
        path: "$.isDeleted"
      },
      isVisible: {
        type: "boolean",
        path: "$.isVisible"
      },
      metaDescription: {
        type: "string",
        path: "$.metaDescription"
      },
      metafields: {
        type: "array",
        items: [
          {
            type: "object",
            properties: {
              key: {
                type: "string",
                maxLength: 30,
                path: "$.metafields.[0].key"
              },
              namespace: {
                type: "string",
                maxLength: 20,
                path: "$.metafields.[0].namespace"
              },
              scope: {
                type: "string",
                path: "$.metafields.[0].scope"
              },
              value: {
                type: "string",
                path: "$.metafields.[0].value"
              },
              valueType: {
                type: "string",
                path: "$.metafields.[0].valueType"
              },
              description: {
                type: "string",
                path: "$.metafields.[0].description"
              }
            },
            required: [],
            additionalProperties: false,
            path: "$.metafields.[0]"
          }
        ],
        additionalItems: false,
        path: "$.metafields"
      },
      originCountry: {
        type: "string",
        path: "$.originCountry"
      },
      pageTitle: {
        type: "string",
        path: "$.pageTitle"
      },
      parcel: {
        type: "object",
        properties: {
          containers: {
            type: "string",
            path: "$.parcel.containers"
          },
          length: {
            type: "number",
            path: "$.parcel.length"
          },
          width: {
            type: "number",
            path: "$.parcel.width"
          },
          height: {
            type: "number",
            path: "$.parcel.height"
          },
          weight: {
            type: "number",
            path: "$.parcel.weight"
          }
        },
        required: [],
        additionalProperties: false,
        path: "$.parcel"
      },
      pinterestMsg: {
        type: "string",
        maxLength: 255,
        path: "$.pinterestMsg"
      },
      productType: {
        type: "string",
        path: "$.productType"
      },
      publishedAt: {
        type: "string",
        format: "date-time",
        path: "$.publishedAt"
      },
      publishedProductHash: {
        type: "string",
        path: "$.publishedProductHash"
      },
      shopId: {
        type: "string",
        path: "$.shopId"
      },
      shouldAppearInSitemap: {
        type: "boolean",
        path: "$.shouldAppearInSitemap"
      },
      supportedFulfillmentTypes: {
        type: "array",
        items: [
          {
            type: "string",
            path: "$.supportedFulfillmentTypes.[0]"
          }
        ],
        additionalItems: false,
        path: "$.supportedFulfillmentTypes"
      },
      template: {
        type: "string",
        path: "$.template"
      },
      title: {
        type: "string",
        path: "$.title"
      },
      twitterMsg: {
        type: "string",
        maxLength: 140,
        path: "$.twitterMsg"
      },
      type: {
        type: "string",
        path: "$.type"
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        path: "$.updatedAt"
      },
      vendor: {
        type: "string",
        path: "$.vendor"
      },
      workflow: {
        type: "object",
        properties: {
          status: {
            type: "string",
            path: "$.workflow.status"
          },
          workflow: {
            type: "array",
            items: [
              {
                type: "string",
                path: "$.workflow.workflow.[0]"
              }
            ],
            additionalItems: false,
            path: "$.workflow.workflow"
          }
        },
        required: [
          "status"
        ],
        additionalProperties: false,
        path: "$.workflow"
      }
    },
    required: [
      "_id",
      "ancestors",
      "createdAt",
      "handle",
      "isDeleted",
      "isVisible",
      "shopId",
      "supportedFulfillmentTypes",
      "title",
      "type"
    ],
    additionalProperties: false,
    path: "$"
  };

  expect(resultSchema).toEqual(expectedSchema);
});
