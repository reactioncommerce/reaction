import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Random from "@reactioncommerce/random";
import canBeApplied from "../utils/canBeApplied.js";
import isPromotionExpired from "../utils/isPromotionExpired.js";
import applyPromotions, { createCartMessage } from "./applyPromotions.js";

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
  actions: [{ actionKey: "test" }],
  triggers: [{ triggerKey: "test", triggerParameters: { name: "test trigger" } }],
  stackability: {
    key: "none",
    parameters: {}
  }
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("should save cart with implicit promotions are applied", async () => {
  const cart = {
    _id: "cartId"
  };
  mockContext.collections.Promotions = {
    find: () => ({ toArray: jest.fn().mockResolvedValueOnce([testPromotion]) })
  };
  mockContext.promotions = pluginPromotion;
  mockContext.simpleSchemas = {
    Cart: { clean: jest.fn() }
  };
  canBeApplied.mockReturnValueOnce({ qualifies: true });
  testAction.mockReturnValue({ affected: true });

  await applyPromotions(mockContext, cart);

  expect(testTrigger).toBeCalledWith(mockContext, expect.objectContaining({ _id: cart._id }), {
    promotion: testPromotion,
    triggerParameters: { name: "test trigger" }
  });
  expect(testAction).toBeCalledWith(mockContext, expect.objectContaining({ _id: cart._id }), {
    actionKey: "test",
    promotion: testPromotion
  });
  expect(testEnhancer).toBeCalledWith(mockContext, expect.objectContaining({ _id: cart._id }));

  const expectedCart = { ...cart, appliedPromotions: [testPromotion] };
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
    canBeApplied.mockReturnValue({ qualifies: false, reason: "Can't be combine" });
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

    mockContext.promotions = { ...pluginPromotion, triggers: [], qualifiers: [] };
    mockContext.simpleSchemas = {
      Cart: { clean: jest.fn() }
    };

    await applyPromotions(mockContext, cart);

    expect(cart.messages[0].title).toEqual("The promotion cannot be applied");
    expect(cart.messages[0].message).toEqual("Can't be combine");
  });
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
