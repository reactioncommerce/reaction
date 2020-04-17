import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import Factory from "../tests/factory.js";
import updateOrder from "./updateOrder.js";

beforeEach(() => {
  jest.resetAllMocks();
});

const orderId = "order1";

test("throws if orderId isn't supplied", async () => {
  await expect(updateOrder(mockContext, {})).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(null));

  await expect(updateOrder(mockContext, {
    orderId
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if permission check fails", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "order1",
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

  await expect(updateOrder(mockContext, {
    orderId
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    `reaction:legacy:orders:${orderId}`,
    "update",
    { shopId: "SHOP_ID" }
  );
});

test("skips update if one is not necessary", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    customFields: {
      foo: "boo"
    },
    email: "old@email.com",
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: Factory.OrderItem.makeMany(2)
      })
    ],
    shopId: "SHOP_ID",
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  }));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await updateOrder(mockContext, { orderId });

  expect(mockContext.collections.Orders.findOneAndUpdate).not.toHaveBeenCalled();
});

test("updates an order", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    customFields: {
      foo: "boo"
    },
    email: "old@email.com",
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: Factory.OrderItem.makeMany(2)
      })
    ],
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

  await updateOrder(mockContext, {
    customFields: {
      foo: "bar"
    },
    email: "new@email.com",
    orderId,
    status: "NEW_STATUS"
  });

  expect(mockContext.collections.Orders.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: orderId },
    {
      $set: {
        "customFields": {
          foo: "bar"
        },
        "email": "new@email.com",
        "updatedAt": jasmine.any(Date),
        "workflow.status": "NEW_STATUS"
      },
      $push: {
        "workflow.workflow": "NEW_STATUS"
      }
    },
    { returnOriginal: false }
  );
});
