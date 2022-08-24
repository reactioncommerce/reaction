import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import Factory from "../tests/factory.js";
import {
  restore as restore$updateGroupTotals,
  rewire as rewire$updateGroupTotals
} from "../util/updateGroupTotals.js";
import splitOrderItem from "./splitOrderItem.js";

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(() => {
  restore$updateGroupTotals();
});

test("throws if orderId isn't supplied", async () => {
  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    newItemQuantity: 1
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if itemId isn't supplied", async () => {
  await expect(splitOrderItem(mockContext, {
    orderId: "abc",
    newItemQuantity: 1
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if newItemQuantity isn't supplied", async () => {
  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    orderId: "abc"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if newItemQuantity is 0", async () => {
  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    orderId: "abc",
    newItemQuantity: 0
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if newItemQuantity is negative", async () => {
  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    orderId: "abc",
    newItemQuantity: -1
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(null));

  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    orderId: "abc",
    newItemQuantity: 1
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order item doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        items: [
          {
            _id: "xyz",
            workflow: {
              status: "new",
              workflow: ["new"]
            }
          }
        ],
        workflow: {
          status: "new",
          workflow: ["new"]
        }
      }
    ],
    shopId: "SHOP_ID",
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  }));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    orderId: "abc",
    newItemQuantity: 1
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if permission check fails", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "abc",
    shipping: [
      {
        items: []
      }
    ],
    shopId: "SHOP_ID"
  }));

  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    orderId: "abc",
    newItemQuantity: 1
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:orders:abc",
    "move:item",
    { shopId: "SHOP_ID" }
  );
});

test("throws if newItemQuantity is equal to item quantity", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        items: [
          { _id: "abc", quantity: 2 }
        ]
      }
    ],
    shopId: "SHOP_ID"
  }));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    orderId: "abc",
    newItemQuantity: 2
  })).rejects.toThrowErrorMatchingSnapshot();
});


test("throws if newItemQuantity is greater than item quantity", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        items: [
          { _id: "abc", quantity: 1 }
        ]
      }
    ],
    shopId: "SHOP_ID"
  }));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    orderId: "abc",
    newItemQuantity: 2
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the database update fails", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: [
          Factory.OrderItem.makeOne({
            _id: "abc",
            quantity: 3,
            price: {
              amount: 1,
              currencyCode: "USD"
            },
            subtotal: 3,
            workflow: {
              status: "new",
              workflow: ["new"]
            }
          })
        ],
        workflow: {
          status: "new",
          workflow: ["new"]
        }
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

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 0
  }));

  await expect(splitOrderItem(mockContext, {
    itemId: "abc",
    orderId: "abc",
    newItemQuantity: 1
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("splits an item", async () => {
  const item1 = Factory.OrderItem.makeOne({
    _id: "ITEM_1",
    price: {
      amount: 5,
      currencyCode: "USD"
    },
    quantity: 5,
    subtotal: 25,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const item2 = Factory.OrderItem.makeOne({
    _id: "ITEM_2",
    price: {
      amount: 5,
      currencyCode: "USD"
    },
    quantity: 1,
    subtotal: 5,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const group = Factory.OrderFulfillmentGroup.makeOne({
    items: [item1, item2],
    itemIds: [item1._id, item2._id],
    totalItemQuantity: 6
  });

  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "ORDER_1",
    shipping: [group],
    shopId: "SHOP_ID",
    totalItemQuantity: 6,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  }));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  const mockUpdateGroupTotals = jest.fn().mockName("updateGroupTotals").mockReturnValue(Promise.resolve({ groupSurcharges: [] }));
  rewire$updateGroupTotals(mockUpdateGroupTotals);

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1,
    value: {}
  }));

  await splitOrderItem(mockContext, {
    itemId: "ITEM_1",
    orderId: "ORDER_1",
    newItemQuantity: 3
  });

  expect(mockContext.collections.Orders.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: "ORDER_1" },
    {
      $set: {
        shipping: [
          {
            ...group,
            items: [
              {
                ...item1,
                quantity: 2,
                subtotal: 10
              },
              item2,
              {
                ...item1,
                _id: jasmine.any(String),
                quantity: 3,
                subtotal: 15
              }
            ],
            itemIds: [item1._id, item2._id, jasmine.any(String)],
            totalItemQuantity: 6
          }
        ],
        surcharges: [],
        updatedAt: jasmine.any(Date),
        totalItemQuantity: 6
      }
    },
    { returnOriginal: false }
  );
});
