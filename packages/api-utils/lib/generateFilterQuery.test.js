import generateFilterQuery from "./generateFilterQuery.js";
import mockCollection from "./tests/mockCollection.js";
import mockContext from "./tests/mockContext.js";

mockContext.collections.Products = mockCollection("Products");

jest.mock("./collectCollectionFields", () => jest.fn().mockImplementation(() => ({
  "_id": "SimpleSchema.String",
  "ancestors": "SimpleSchema.Array",
  "ancestors.$": "SimpleSchema.String",
  "createdAt": "SimpleSchema.Date",
  "currentProductHash": "SimpleSchema.String",
  "description": "SimpleSchema.String",
  "facebookMsg": "SimpleSchema.String",
  "googleplusMsg": "SimpleSchema.String",
  "handle": "SimpleSchema.String",
  "hashtags": "SimpleSchema.Array",
  "hashtags.$": "SimpleSchema.String",
  "isDeleted": "SimpleSchema.Boolean",
  "isVisible": "SimpleSchema.Boolean",
  "metaDescription": "SimpleSchema.String",
  "metafields": "SimpleSchema.Array",
  "metafields.$.key": "SimpleSchema.String",
  "metafields.$.namespace": "SimpleSchema.String",
  "metafields.$.scope": "SimpleSchema.String",
  "metafields.$.value": "SimpleSchema.String",
  "metafields.$.valueType": "SimpleSchema.String",
  "metafields.$.description": "SimpleSchema.String",
  "originCountry": "SimpleSchema.String",
  "pageTitle": "SimpleSchema.String",
  "parcel.containers": "SimpleSchema.String",
  "parcel.length": "SimpleSchema.Number",
  "parcel.width": "SimpleSchema.Number",
  "parcel.height": "SimpleSchema.Number",
  "parcel.weight": "SimpleSchema.Number",
  "pinterestMsg": "SimpleSchema.String",
  "productType": "SimpleSchema.String",
  "publishedAt": "SimpleSchema.Date",
  "publishedProductHash": "SimpleSchema.String",
  "shopId": "SimpleSchema.String",
  "shouldAppearInSitemap": "SimpleSchema.Boolean",
  "supportedFulfillmentTypes": "SimpleSchema.Array",
  "supportedFulfillmentTypes.$": "SimpleSchema.String",
  "template": "SimpleSchema.String",
  "title": "SimpleSchema.String",
  "twitterMsg": "SimpleSchema.String",
  "type": "SimpleSchema.String",
  "updatedAt": "SimpleSchema.Date",
  "vendor": "SimpleSchema.String",
  "workflow.status": "SimpleSchema.String",
  "workflow.workflow": "SimpleSchema.Array",
  "workflow.workflow.$": "SimpleSchema.String",
  "price.range": "SimpleSchema.String",
  "price.min": "SimpleSchema.Number",
  "price.max": "SimpleSchema.Number"
})));


test("returns the correct Query when single condition is given", () => {
  const shopId = "SHOP123";
  const collectionName = "Product";
  const conditions = {
    all: [{
      all: [
        {
          key: "handle",
          stringValue: "mens-waterproof-outdoor-rain-jacket",
          relationalOperator: "eq",
          logicalNot: false
        }
      ]
    }]
  };

  const { filterQuery } = generateFilterQuery(mockContext, collectionName, conditions, shopId);

  const expectedResult = {
    $and: [{
      $and: [
        {
          handle: {
            $eq: "mens-waterproof-outdoor-rain-jacket"
          }
        }
      ]
    }],
    shopId: "SHOP123"
  };

  expect(filterQuery).toStrictEqual(expectedResult);
});

test("returns the correct Query when two conditions are given", () => {
  const shopId = "SHOP123";
  const collectionName = "Product";
  const conditions = {
    any: [
      {
        all: [
          {
            key: "handle",
            stringValue: "mens-waterproof-outdoor-rain-jacket",
            relationalOperator: "eq",
            logicalNot: false
          },
          {
            key: "_id",
            stringValue: "DZwLHk4EAzitRni8F",
            relationalOperator: "eq",
            logicalNot: false
          }
        ]
      }
    ]
  };

  const { filterQuery } = generateFilterQuery(mockContext, collectionName, conditions, shopId);

  const expectedResult = {
    $or: [
      {
        $and: [
          {
            handle: {
              $eq: "mens-waterproof-outdoor-rain-jacket"
            }
          },
          {
            _id: {
              $eq: "DZwLHk4EAzitRni8F"
            }
          }
        ]
      }
    ],
    shopId: "SHOP123"
  };
  expect(filterQuery).toStrictEqual(expectedResult);
});


test("returns the correct Query when multiple conditions are given", () => {
  const shopId = "SHOP123";
  const collectionName = "Product";
  const conditions = {
    all: [
      {
        any: [
          {
            key: "handle",
            stringValue: "mens-waterproof-outdoor-rain-jacket",
            relationalOperator: "eq",
            logicalNot: false
          },
          {
            key: "title",
            stringValue: "men",
            relationalOperator: "beginsWith",
            logicalNot: false,
            caseSensitive: false
          }
        ]
      },
      {
        all: [
          {
            key: "_id",
            stringArrayValue: ["DZwLHk4EAzitRni8F", "Hn4BRaBvLkYffMq36"],
            relationalOperator: "in",
            logicalNot: false
          },
          {
            key: "isDeleted",
            booleanValue: false,
            relationalOperator: "eq",
            logicalNot: false
          },
          {
            key: "workflow.status",
            stringValue: "new",
            relationalOperator: "eq",
            logicalNot: false
          }
        ]
      },
      {
        all: [
          {
            key: "price.min",
            floatValue: 19.99,
            relationalOperator: "gte",
            logicalNot: false
          },
          {
            key: "type",
            stringValue: "simple",
            relationalOperator: "eq",
            logicalNot: false
          }
        ]
      }
    ]
  };

  const { filterQuery } = generateFilterQuery(mockContext, collectionName, conditions, shopId);

  const expectedResult = {
    $and: [
      {
        $or: [
          {
            handle: {
              $eq: "mens-waterproof-outdoor-rain-jacket"
            }
          },
          {
            title: {
              $regex: "^men",
              $options: "i"
            }
          }
        ]
      },
      {
        $and: [
          {
            _id: {
              $in: [
                "DZwLHk4EAzitRni8F",
                "Hn4BRaBvLkYffMq36"
              ]
            }
          },
          {
            isDeleted: {
              $eq: false
            }
          },
          {
            "workflow.status": {
              $eq: "new"
            }
          }
        ]
      },
      {
        $and: [
          {
            "price.min": {
              $gte: 19.99
            }
          },
          {
            type: {
              $eq: "simple"
            }
          }
        ]
      }
    ],
    shopId: "SHOP123"
  };

  expect(filterQuery).toStrictEqual(expectedResult);
});
