import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import orderById from "./orderById";

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws if orderId isn't supplied", async () => {
  await expect(orderById(mockContext, {
    itemId: "abc",
    newItemQuantity: 1
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if itemId isn't supplied", async () => {
  await expect(orderById(mockContext, {
    orderId: "abc",
    newItemQuantity: 1
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(null));

  await expect(orderById(mockContext, {
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

  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(orderById(mockContext, {
    itemId: "abc",
    orderId: "abc",
    newItemQuantity: 1
  })).rejects.toThrowErrorMatchingSnapshot();
});
