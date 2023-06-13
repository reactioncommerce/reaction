import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import canBeApplied from "../utils/canBeApplied.js";
import isPromotionExpired from "../utils/isPromotionExpired.js";
import triggerHandler from "../utils/triggerHandler.js";
import applyCombinationPromotions from "./applyCombinationPromotions.js";
import applyPromotions, { getCurrentTime } from "./applyPromotions.js";

jest.mock("./applyCombinationPromotions.js", () => jest.fn());
jest.mock("../utils/canBeApplied.js", () => jest.fn());
jest.mock("../utils/isPromotionExpired.js", () => jest.fn());
jest.mock("../utils/triggerHandler.js", () => jest.fn());

const testTrigger = jest.fn().mockReturnValue(Promise.resolve(true));
const testAction = jest.fn();
const testEnhancer = jest.fn().mockImplementation((context, cart) => cart);

const pluginPromotion = {
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
  jest.resetAllMocks();
});

test("should save cart with implicit promotions are applied", async () => {
  isPromotionExpired.mockReturnValue(false);
  triggerHandler.mockResolvedValue(true);
  const cart = {
    _id: "cartId",
    appliedPromotions: [],
    messages: []
  };
  mockContext.collections.Promotions = {
    find: (qs) => ({
      toArray: jest.fn().mockImplementation(() => {
        if (qs.triggerType === "implicit") return [testPromotion];
        return [];
      })
    })
  };
  mockContext.promotions = pluginPromotion;
  mockContext.promotions.combinationFilters = [];
  mockContext.simpleSchemas = {
    Cart: { clean: jest.fn() },
    CartPromotionItem: { clean: jest.fn() }
  };
  applyCombinationPromotions.mockImplementation((context, _cart, params) => {
    _cart.appliedPromotions = params.promotions;
  });

  await applyPromotions(mockContext, cart);

  expect(triggerHandler).toBeCalledWith(mockContext, expect.objectContaining({ _id: cart._id }), testPromotion);
  expect(testEnhancer).toBeCalledWith(mockContext, expect.objectContaining({ _id: cart._id }));

  const expectedCart = { ...cart, appliedPromotions: [{ ...testPromotion }] };
  expect(cart).toEqual(expectedCart);
});

test("should update cart with implicit promotions are not applied when promotions don't contain trigger", async () => {
  const cart = {
    _id: "cartId",
    appliedPromotions: [],
    messages: []
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
      appliedPromotions: [promotion],
      messages: []
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

  test("should have promotion no longer available message when promotion is disabled", async () => {
    isPromotionExpired.mockReturnValue(false);

    const promotion = {
      ...testPromotion,
      _id: "promotionId",
      triggerType: "implicit",
      enabled: false
    };
    mockContext.collections.Promotions = {
      find: (qs) => ({
        toArray: jest.fn().mockImplementation(() => {
          if (qs.triggerType === "implicit") return [promotion];
          return [];
        })
      })
    };
    const cart = {
      _id: "cartId",
      appliedPromotions: [promotion],
      messages: []
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
      triggerType: "explicit"
    };
    const cart = {
      _id: "cartId",
      appliedPromotions: [promotion],
      messages: []
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

  test("should not have promotion message when the promotion already message added", async () => {
    isPromotionExpired.mockReturnValue(true);

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
      find: (qs) => ({
        toArray: jest.fn().mockImplementation(() => {
          if (qs.triggerType === "explicit") return [promotion];
          return [];
        })
      })
    };

    triggerHandler.mockResolvedValue(true);

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
    appliedPromotions: [],
    messages: []
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

test("throw error when explicit promotion is newly applied and conflict with other", async () => {
  isPromotionExpired.mockReturnValue(false);
  triggerHandler.mockResolvedValue(true);

  const promotion = {
    ...testPromotion,
    _id: "promotionId",
    triggerType: "implicit"
  };
  const secondPromotion = {
    ...testPromotion,
    _id: "promotionId2",
    triggerType: "explicit",
    newlyAdded: true,
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
    appliedPromotions: [promotion, secondPromotion],
    messages: []
  };

  mockContext.collections.Promotions = {
    find: (qs) => ({
      toArray: jest.fn().mockImplementation(() => {
        if (qs.triggerType === "explicit") return [secondPromotion];
        return [promotion];
      })
    })
  };

  applyCombinationPromotions.mockImplementation((context, _cart, params) => {
    _cart.messages = [
      {
        message: "Stackability conflict",
        metaFields: {
          promotionId: params.promotions[1]._id
        }
      }
    ];
  });

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
