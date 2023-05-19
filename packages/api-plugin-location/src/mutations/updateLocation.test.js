import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateLocation from "./updateLocation.js";

test("update location and returns the result", async () => {
  const location = {
    shopId: "123",
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
  const result = { modifiedCount: 1, value: { _id: "123" } };
  mockContext.collections = {
    Locations: {
      findOneAndUpdate: jest.fn().mockReturnValueOnce(Promise.resolve(result))
    }
  };

  const updatedLocation = await updateLocation(mockContext, input);

  expect(updatedLocation).toEqual({
    success: true,
    location: {
      _id: "123"
    }
  });
});
