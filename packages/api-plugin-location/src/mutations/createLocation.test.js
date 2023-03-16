import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createLocation from "./createLocation.js";

test("throws if shop not found", async () => {
  const input = { shopId: "123", name: "Test location" };
  mockContext.collections = {
    Shops: {
      findOne: jest.fn().mockReturnValueOnce(Promise.resolve(null))
    }
  };

  try {
    await createLocation(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("Shop not found");
  }
});

test("create location and returns the result", async () => {
  const location = {
    shopId: "123",
    identifier: "test-location",
    name: "Test location",
    type: "marketplace",
    address: {
      address1: "123 Main St",
      city: "New York",
      region: "NY",
      postal: "10001",
      country: "US"
    },
    phoneNumber: "123-456-7890",
    fulfillmentMethod: "shipping"
  };
  const input = { shopId: "123", location };
  const result = { insertedCount: 1 };
  mockContext.collections = {
    Shops: {
      findOne: jest.fn().mockReturnValueOnce(Promise.resolve({ _id: "123" }))
    },
    Locations: {
      insertOne: jest.fn().mockReturnValueOnce(Promise.resolve(result))
    }
  };

  const createdLocation = await createLocation(mockContext, input);

  expect(createdLocation).toEqual({
    success: true,
    location: {
      _id: expect.any(String),
      ...location
    }
  });
});
