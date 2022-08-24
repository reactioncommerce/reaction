import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import Factory from "../tests/factory.js";
import {
  restore as restore$buildOrderFulfillmentGroupFromInput,
  rewire as rewire$buildOrderFulfillmentGroupFromInput
} from "../util/buildOrderFulfillmentGroupFromInput.js";
import {
  restore as restore$updateGroupTotals,
  rewire as rewire$updateGroupTotals
} from "../util/updateGroupTotals.js";
import addOrderFulfillmentGroup from "./addOrderFulfillmentGroup.js";

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(() => {
  restore$buildOrderFulfillmentGroupFromInput();
  restore$updateGroupTotals();
});

test("throws if orderId isn't supplied", async () => {
  const fulfillmentGroup = Factory.orderFulfillmentGroupInputSchema.makeOne({});

  // There is a bug where Factory always adds _id
  delete fulfillmentGroup._id;

  await expect(addOrderFulfillmentGroup(mockContext, { fulfillmentGroup })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if fulfillmentGroup isn't supplied", async () => {
  await expect(addOrderFulfillmentGroup(mockContext, { orderId: "123" })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(null));

  const fulfillmentGroup = Factory.orderFulfillmentGroupInputSchema.makeOne({});

  // There is a bug where Factory always adds _id
  delete fulfillmentGroup._id;

  await expect(addOrderFulfillmentGroup(mockContext, {
    fulfillmentGroup,
    orderId: "order1"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if permission check fails", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "order1",
    shipping: [
      {
        _id: "123",
        items: []
      }
    ],
    shopId: "SHOP_ID"
  }));

  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  const fulfillmentGroup = Factory.orderFulfillmentGroupInputSchema.makeOne({});

  // There is a bug where Factory always adds _id
  delete fulfillmentGroup._id;

  await expect(addOrderFulfillmentGroup(mockContext, {
    fulfillmentGroup,
    orderId: "order1"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:orders:order1",
    "update",
    { shopId: "SHOP_ID" }
  );
});

test("throws if an item ID being moved does not exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "123",
        items: Factory.OrderItem.makeMany(2, {
          _id: (index) => `ITEM_1_${index}`
        })
      }),
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "345",
        items: Factory.OrderItem.makeMany(2, {
          _id: (index) => `ITEM_2_${index}`
        })
      })
    ],
    shopId: "SHOP_ID",
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  }));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  const mockUpdateGroupTotals = jest.fn().mockName("updateGroupTotals").mockReturnValue(Promise.resolve({ groupSurcharges: [] }));
  rewire$updateGroupTotals(mockUpdateGroupTotals);

  const fulfillmentGroup = Factory.orderFulfillmentGroupInputSchema.makeOne({});

  // There is a bug where Factory always adds _id
  delete fulfillmentGroup._id;

  await expect(addOrderFulfillmentGroup(mockContext, {
    fulfillmentGroup,
    moveItemIds: ["xyz"],
    orderId: "order1"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("adds an order fulfillment group", async () => {
  const originalGroups = [
    Factory.OrderFulfillmentGroup.makeOne({
      _id: "123",
      items: Factory.OrderItem.makeMany(2, {
        quantity: 1,
        workflow: {
          status: "new",
          workflow: ["new"]
        }
      }),
      totalItemQuantity: 2
    }),
    Factory.OrderFulfillmentGroup.makeOne({
      items: Factory.OrderItem.makeMany(2, {
        _id: "345",
        quantity: 1,
        workflow: {
          status: "new",
          workflow: ["new"]
        }
      }),
      totalItemQuantity: 2
    })
  ];

  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: originalGroups,
    shopId: "SHOP_ID",
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  }));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1,
    value: {}
  }));

  const newGroup = Factory.OrderFulfillmentGroup.makeOne({
    items: [
      Factory.OrderItem.makeOne({
        _id: "ITEM_1",
        quantity: 1,
        price: {
          amount: 1,
          currencyCode: "USD"
        },
        subtotal: 1,
        workflow: {
          status: "new",
          workflow: ["new"]
        }
      })
    ],
    totalItemQuantity: 1,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  const mockBuildOrderFulfillmentGroupFromInput = jest.fn().mockName("buildOrderFulfillmentGroupFromInput");
  mockBuildOrderFulfillmentGroupFromInput.mockReturnValueOnce(Promise.resolve({
    group: newGroup,
    groupSurcharges: []
  }));
  rewire$buildOrderFulfillmentGroupFromInput(mockBuildOrderFulfillmentGroupFromInput);

  const fulfillmentGroup = Factory.orderFulfillmentGroupInputSchema.makeOne({});

  // There is a bug where Factory always adds _id
  delete fulfillmentGroup._id;

  await addOrderFulfillmentGroup(mockContext, {
    fulfillmentGroup,
    orderId: "order1"
  });

  expect(mockContext.collections.Orders.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: "order1" },
    {
      $set: {
        shipping: [
          ...originalGroups,
          newGroup
        ],
        surcharges: [],
        totalItemQuantity: 5,
        updatedAt: jasmine.any(Date)
      }
    },
    { returnOriginal: false }
  );
});
