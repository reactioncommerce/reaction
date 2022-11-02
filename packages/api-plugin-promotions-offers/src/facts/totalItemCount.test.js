import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import totalItemCount from "./totalItemCount.js";

test("should return correct total item count from default fact", async () => {
  const cart = {
    _id: "cartId",
    items: [
      {
        _id: "1",
        quantity: 1
      },
      {
        _id: "1",
        quantity: 2
      }
    ]
  };
  const parameters = {
    fromFact: ""
  };
  const almanac = {
    factValue: jest.fn().mockName("factValue").mockResolvedValue(cart)
  };
  const total = await totalItemCount(mockContext, parameters, almanac);
  expect(total).toEqual(3);
});

test("should return correct total item count from provided fact", async () => {
  const items = [
    {
      _id: "1",
      quantity: 1
    },
    {
      _id: "1",
      quantity: 2
    }
  ];
  const parameters = {
    fromFact: "testFact"
  };
  const almanac = {
    factValue: jest.fn().mockImplementation((fact) => {
      if (fact === "testFact") {
        return Promise.resolve(items);
      }
      return null;
    })
  };
  const total = await totalItemCount(mockContext, parameters, almanac);
  expect(total).toEqual(3);
});
