import moveOrderItems from "./moveOrderItems";
import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws if orderId isn't supplied", async () => {
  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if itemIds isn't supplied", async () => {
  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if itemIds is empty", async () => {
  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: [],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if fromFulfillmentGroupId isn't supplied", async () => {
  await expect(moveOrderItems(mockContext, {
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if toFulfillmentGroupId isn't supplied", async () => {
  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(null));

  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the fromFulfillmentGroup doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        _id: "group200",
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

  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the toFulfillmentGroup doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        _id: "group1",
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

  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if an order item doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        _id: "group1",
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
      },
      {
        _id: "group2",
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

  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if permission check fails", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        items: []
      }
    ],
    shopId: "SHOP_ID"
  }));

  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["orders"], "SHOP_ID");
});

test("throws if user who placed order tries to move item at invalid current item status", async () => {
  const accountId = "ACCOUNT_ID";

  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    accountId,
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group1",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item1",
            quantity: 1,
            workflow: {
              status: "processing",
              workflow: ["new", "processing"]
            }
          })
        ],
        workflow: {
          status: "new",
          workflow: ["new"]
        }
      }),
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group2",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item2",
            quantity: 1,
            workflow: {
              status: "processing",
              workflow: ["new", "processing"]
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

  mockContext.accountId = accountId;

  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();

  mockContext.accountId = null;
});

test("throws if user who placed order tries to move item at invalid current order status", async () => {
  const accountId = "ACCOUNT_ID";

  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    accountId,
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group1",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item1",
            quantity: 1,
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
      }),
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group2",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item2",
            quantity: 1,
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
      status: "processing",
      workflow: ["new", "processing"]
    }
  }));

  mockContext.accountId = accountId;

  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();

  mockContext.accountId = null;
});

test("throws if the from group would have no items remaining", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group1",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item1",
            quantity: 1,
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
      }),
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group2",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item2",
            quantity: 1,
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

  mockContext.userHasPermission.mockReturnValueOnce(true);

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 0
  }));

  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the database update fails", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group1",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item1",
            quantity: 1,
            workflow: {
              status: "new",
              workflow: ["new"]
            }
          }),
          Factory.OrderItem.makeOne({
            _id: "item10",
            quantity: 1,
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
      }),
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group2",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item2",
            quantity: 1,
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

  mockContext.userHasPermission.mockReturnValueOnce(true);

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 0
  }));

  await expect(moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("skips permission check if context.isInternalCall", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group1",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item1",
            quantity: 1,
            workflow: {
              status: "new",
              workflow: ["new"]
            }
          }),
          Factory.OrderItem.makeOne({
            _id: "item10",
            quantity: 1,
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
      }),
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group2",
        items: [
          Factory.OrderItem.makeOne({
            _id: "item2",
            quantity: 1,
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

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1,
    value: {}
  }));

  mockContext.isInternalCall = true;

  await moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  });

  delete mockContext.isInternalCall;

  expect(mockContext.userHasPermission).not.toHaveBeenCalled();
});

test("moves items", async () => {
  const group1Items = Factory.OrderItem.makeMany(3, {
    _id: (index) => `item_1_${index}`,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const group2Items = Factory.OrderItem.makeMany(2, {
    _id: (index) => `item_2_${index}`,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const group1 = Factory.OrderFulfillmentGroup.makeOne({
    _id: "group1",
    items: group1Items
  });

  const group2 = Factory.OrderFulfillmentGroup.makeOne({
    _id: "group2",
    items: group2Items
  });

  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "order1",
    shipping: [group1, group2],
    shopId: "SHOP_ID",
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  }));

  mockContext.userHasPermission.mockReturnValueOnce(true);

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1,
    value: {}
  }));

  await moveOrderItems(mockContext, {
    fromFulfillmentGroupId: "group1",
    itemIds: ["item_1_0", "item_1_1"],
    orderId: "order1",
    toFulfillmentGroupId: "group2"
  });

  expect(mockContext.collections.Orders.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: "order1" },
    {
      $set: {
        shipping: [
          {
            ...group1,
            items: [group1.items[2]]
          },
          {
            ...group2,
            items: [...group2.items, group1.items[0], group1.items[1]]
          }
        ],
        updatedAt: jasmine.any(Date)
      }
    },
    { returnOriginal: false }
  );
});
