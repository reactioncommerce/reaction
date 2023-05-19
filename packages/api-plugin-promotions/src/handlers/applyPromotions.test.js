import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Random from "@reactioncommerce/random";
import canBeApplied from "../utils/canBeApplied.js";
import isPromotionExpired from "../utils/isPromotionExpired.js";
import applyPromotions, { createCartMessage, getCurrentTime } from "./applyPromotions.js";

jest.mock("../utils/canBeApplied.js", () => jest.fn());
jest.mock("../utils/isPromotionExpired.js", () => jest.fn());

const testTrigger = jest.fn().mockReturnValue(Promise.resolve(true));
const testAction = jest.fn();
const testEnhancer = jest.fn().mockImplementation((context, cart) => cart);

const pluginPromotion = {
  triggers: [{ key: "test", handler: testTrigger }],
  actions: [{ key: "test", handler: testAction }],
  enhancers: [testEnhancer],
  qualifiers: []
};

const testPromotion = {
  _id: "test id",
  actions: [{ actionKey: "test", actionParameters: { discountType: "order" } }],
  triggers: [{ triggerKey: "test", triggerParameters: { name: "test trigger" } }],
  triggerType: "implicit",
  stackability: {
    key: "none",
    parameters: {}
  },
  enabled: true
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("should save cart with implicit promotions are applied", async () => {
  const cart = {
    _id: "cartId"
  };
  mockContext.collections.Promotions = {
    find: ({ triggerType }) => ({
      toArray: jest.fn().mockImplementation(() => {
        if (triggerType === "implicit") {
          return [testPromotion];
        }
        return [];
      })
    })
  };
  mockContext.promotions = pluginPromotion;
  mockContext.simpleSchemas = {
    Cart: { clean: jest.fn() },
    CartPromotionItem: { clean: jest.fn() }
  };
  canBeApplied.mockResolvedValue({ qualifies: true });
  testAction.mockResolvedValue({ affected: true });

  await applyPromotions(mockContext, cart);

  expect(testTrigger).toBeCalledWith(mockContext, expect.objectContaining({ _id: cart._id }), {
    promotion: testPromotion,
    triggerParameters: { name: "test trigger" }
  });
  expect(testAction).toBeCalledWith(mockContext, expect.objectContaining({ _id: cart._id }), {
    actionKey: "test",
    promotion: testPromotion,
    actionParameters: { discountType: "order" }
  });
  expect(testEnhancer).toBeCalledWith(mockContext, expect.objectContaining({ _id: cart._id }));

  const expectedCart = { ...cart, appliedPromotions: [{ ...testPromotion, isTemporary: false }] };
  expect(cart).toEqual(expectedCart);
});

test("should update cart with implicit promotions are not applied when promotions don't contain trigger", async () => {
  const cart = {
    _id: "cartId"
  };
  mockContext.collections.Promotions = {
    find: () => ({
      toArray: jest.fn().mockResolvedValueOnce([testPromotion, { ...testPromotion, _id: "test id 2", stackability: { key: "all", parameters: {} } }])
    })
  };

  mockContext.promotions = { ...pluginPromotion, triggers: [], qualifiers: [] };
  mockContext.simpleSchemas = {
    Cart: { clean: jest.fn() }
  };
  canBeApplied.mockReturnValue({ qualifies: true });

  await applyPromotions(mockContext, cart);

  expect(testTrigger).not.toHaveBeenCalled();
  expect(testAction).not.toHaveBeenCalled();

  const expectedCart = { ...cart, appliedPromotions: [] };
  expect(cart).toEqual(expectedCart);
});

test("createCartMessage should return correct cart message", () => {
  jest.spyOn(Random, "id").mockReturnValue("randomId");

  const title = "test title";
  const message = "test message";
  const severity = "error";
  const metaFields = {
    promotionId: "promotionID"
  };
  const subject = "promotion";
  const cartMessage = createCartMessage({ title, message, severity, subject, metaFields });

  expect(cartMessage).toEqual({
    _id: "randomId",
    title,
    message,
    severity,
    subject,
    metaFields,
    acknowledged: false,
    requiresReadAcknowledgement: true
  });
});

describe("cart message", () => {
  test("should have promotion expired message when promotion is expired", async () => {
    isPromotionExpired.mockReturnValue(true);

    const promotion = {
      ...testPromotion,
      _id: "promotionId",
      triggerType: "implicit"
    };
    const cart = {
      _id: "cartId",
      appliedPromotions: [promotion]
    };

    mockContext.collections.Promotions = {
      find: () => ({
        toArray: jest.fn().mockResolvedValueOnce([promotion])
      })
    };

    mockContext.promotions = { ...pluginPromotion, triggers: [], qualifiers: [] };
    mockContext.simpleSchemas = {
      Cart: { clean: jest.fn() }
    };

    await applyPromotions(mockContext, cart);

    expect(cart.messages[0].title).toEqual("The promotion has expired");
  });

  test("should have promotion can't be applied message when promotion can't be applied", async () => {
    testAction.mockResolvedValue({ affected: true });
    canBeApplied.mockResolvedValue({ qualifies: false, reason: "Can't be combine" });
    isPromotionExpired.mockReturnValue(false);

    const promotion = {
      ...testPromotion,
      _id: "promotionId",
      triggerType: "implicit"
    };
    const cart = {
      _id: "cartId",
      appliedPromotions: [promotion]
    };

    mockContext.collections.Promotions = {
      find: () => ({
        toArray: jest.fn().mockResolvedValue([testPromotion, promotion])
      })
    };

    mockContext.promotions = { ...pluginPromotion, qualifiers: [] };
    mockContext.simpleSchemas = {
      Cart: { clean: jest.fn() }
    };

    await applyPromotions(mockContext, cart);

    expect(cart.messages[0].title).toEqual("The promotion cannot be applied");
    expect(cart.messages[0].message).toEqual("Can't be combine");
  });

  test("should have promotion no longer available message when promotion is disabled", async () => {
    isPromotionExpired.mockReturnValue(false);

    const promotion = {
      ...testPromotion,
      _id: "promotionId",
      triggerType: "implicit",
      enabled: false
    };
    mockContext.collections.Promotions = {
      find: () => ({ toArray: jest.fn().mockResolvedValueOnce([promotion]) })
    };
    const cart = {
      _id: "cartId",
      appliedPromotions: [promotion]
    };

    mockContext.collections.Promotions = {
      find: () => ({
        toArray: jest.fn().mockResolvedValueOnce([promotion])
      })
    };

    mockContext.promotions = { ...pluginPromotion, triggers: [], qualifiers: [] };
    mockContext.simpleSchemas = {
      Cart: { clean: jest.fn() }
    };

    await applyPromotions(mockContext, cart);

    expect(cart.messages[0].title).toEqual("The promotion no longer available");
  });

  test("should have promotion is not eligible message when explicit promotion is not eligible", async () => {
    isPromotionExpired.mockReturnValue(false);
    canBeApplied.mockReturnValue({ qualifies: true });

    const promotion = {
      ...testPromotion,
      _id: "promotionId",
      triggerType: "implicit"
    };
    const cart = {
      _id: "cartId",
      appliedPromotions: [promotion]
    };

    mockContext.collections.Promotions = {
      find: () => ({
        toArray: jest.fn().mockResolvedValueOnce([promotion])
      })
    };

    testTrigger.mockReturnValue(Promise.resolve(false));

    mockContext.promotions = { ...pluginPromotion };
    mockContext.simpleSchemas = {
      Cart: { clean: jest.fn() }
    };

    await applyPromotions(mockContext, cart);

    expect(cart.messages[0].title).toEqual("The promotion is not eligible");
  });

  test("should have promotion was not affected message when implicit promotion is not affected in the action", async () => {
    isPromotionExpired.mockReturnValue(false);
    canBeApplied.mockReturnValue({ qualifies: true });

    const promotion = {
      ...testPromotion,
      _id: "promotionId",
      triggerType: "implicit"
    };
    const cart = {
      _id: "cartId",
      appliedPromotions: [promotion]
    };

    mockContext.collections.Promotions = {
      find: () => ({
        toArray: jest.fn().mockResolvedValueOnce([promotion])
      })
    };

    testTrigger.mockReturnValue(Promise.resolve(true));
    testAction.mockReturnValue(Promise.resolve({ affected: false, reason: "Not affected" }));

    mockContext.promotions = { ...pluginPromotion };
    mockContext.simpleSchemas = {
      Cart: { clean: jest.fn() }
    };

    await applyPromotions(mockContext, cart);

    expect(cart.messages[0].title).toEqual("The promotion was not affected");
    expect(cart.messages[0].message).toEqual("Not affected");
  });

  test("should not have promotion message when the promotion already message added", async () => {
    isPromotionExpired.mockReturnValue(false);
    canBeApplied.mockReturnValue({ qualifies: true });

    const promotion = {
      ...testPromotion,
      _id: "promotionId",
      triggerType: "explicit"
    };
    const cart = {
      _id: "cartId",
      appliedPromotions: [promotion],
      messages: [
        {
          title: "The promotion has expired",
          subject: "promotion",
          metaFields: {
            promotionId: "promotionId"
          }
        }
      ]
    };

    mockContext.collections.Promotions = {
      find: () => ({
        toArray: jest.fn().mockResolvedValueOnce([])
      })
    };

    testTrigger.mockReturnValue(Promise.resolve(true));
    testAction.mockReturnValue(Promise.resolve({ affected: false, reason: "Not affected" }));

    mockContext.promotions = { ...pluginPromotion };
    mockContext.simpleSchemas = {
      Cart: { clean: jest.fn() }
    };

    await applyPromotions(mockContext, cart);

    expect(cart.messages.length).toEqual(1);
  });
});

test("getCurrentTime should return system time when user doesn't have preview permission", async () => {
  const shopId = "shopId";
  const date = new Date();

  mockContext.userHasPermission.mockReturnValue(false);

  const time = await getCurrentTime(mockContext, shopId);

  expect(time).toEqual(date);
});

test("getCurrentTime should return custom time when user has preview permission", async () => {
  const shopId = "shopId";
  const customTime = "2023-01-01T00:00:00.000Z";

  mockContext.session = {
    req: {
      headers: { "x-custom-current-promotion-time": customTime }
    }
  };
  mockContext.collections = {
    Promotions: {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockReturnValue([])
      })
    }
  };

  mockContext.userHasPermission.mockReturnValue(true);

  const time = await getCurrentTime(mockContext, shopId);

  expect(time).toEqual(new Date(customTime));
});

test("shouldn't apply promotion when promotion is not enabled", async () => {
  const promotion = {
    ...testPromotion,
    _id: "promotionId",
    enabled: false
  };
  const cart = {
    _id: "cartId",
    appliedPromotions: []
  };

  mockContext.collections.Promotions = {
    find: () => ({
      toArray: jest.fn().mockResolvedValueOnce([promotion])
    })
  };

  mockContext.promotions = { ...pluginPromotion };
  mockContext.simpleSchemas = {
    Cart: { clean: jest.fn() }
  };

  await applyPromotions(mockContext, cart);

  expect(cart.appliedPromotions.length).toEqual(0);
});

test("temporary should apply shipping discount with isTemporary flag when affected but shipmentMethod is not selected", async () => {
  const promotion = {
    ...testPromotion,
    _id: "promotionId",
    enabled: true
  };
  const cart = {
    _id: "cartId",
    appliedPromotions: [],
    shipping: [
      {
        _id: "shippingId",
        shopId: "shopId",
        shipmentQuotes: [
          {
            carrier: "Flat Rate",
            handlingPrice: 2,
            method: {
              name: "globalFlatRateGround",
              cost: 5,
              handling: 2,
              rate: 5,
              _id: "CiHcHJXEeGF9t9z3a",
              carrier: "Flat Rate",
              discount: 4,
              shippingPrice: 7,
              undiscountedRate: 9
            },
            rate: 5,
            shippingPrice: 7,
            discount: 4,
            undiscountedRate: 9
          }
        ]
      }
    ]
  };

  testAction.mockResolvedValue({ affected: false, temporaryAffected: true });

  mockContext.collections.Promotions = {
    find: (query) => ({
      toArray: jest.fn().mockImplementation(() => {
        if (query.triggerType === "explicit") return [];
        return [promotion];
      })
    })
  };

  mockContext.promotions = { ...pluginPromotion };
  mockContext.simpleSchemas = {
    Cart: { clean: jest.fn() },
    CartPromotionItem: {
      clean: jest.fn()
    }
  };
  canBeApplied.mockReturnValue({ qualifies: true });

  await applyPromotions(mockContext, cart);

  expect(cart.appliedPromotions.length).toEqual(1);
  expect(cart.appliedPromotions[0].isTemporary).toEqual(true);
});

test("throw error when explicit promotion is newly applied and conflict with other", async () => {
  isPromotionExpired.mockReturnValue(false);
  canBeApplied.mockReturnValue({ qualifies: false });

  const promotion = {
    ...testPromotion,
    _id: "promotionId",
    triggerType: "implicit"
  };
  const secondPromotion = {
    ...testPromotion,
    _id: "promotionId2",
    triggerType: "explicit",
    newlyApplied: true,
    relatedCoupon: {
      couponCode: "couponCode",
      couponId: "couponId"
    },
    stackability: {
      key: "none",
      parameters: {}
    }
  };
  const cart = {
    _id: "cartId",
    appliedPromotions: [promotion, secondPromotion]
  };

  mockContext.collections.Promotions = {
    find: () => ({
      toArray: jest.fn().mockResolvedValueOnce([promotion, secondPromotion])
    })
  };

  testTrigger.mockReturnValue(Promise.resolve(true));
  testAction.mockReturnValue(Promise.resolve({ affected: true }));

  mockContext.promotions = { ...pluginPromotion };
  mockContext.simpleSchemas = {
    Cart: { clean: jest.fn() }
  };

  try {
    await applyPromotions(mockContext, cart);
  } catch (error) {
    expect(error.error).toEqual("invalid-params");
  }
});
