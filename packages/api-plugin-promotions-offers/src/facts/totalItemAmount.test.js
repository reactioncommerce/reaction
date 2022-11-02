import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import totalItemAmount from "./totalItemAmount.js";

test("should return correct total item amount from default fact", async () => {
  const cart = {
    _id: "cartId",
    items: [
      {
        _id: "1",
        price: {
          amount: 10
        },
        quantity: 1
      },
      {
        _id: "1",
        price: {
          amount: 2
        },
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
  const total = await totalItemAmount(mockContext, parameters, almanac);
  expect(total).toEqual(14);
});

test("should return correct total item amount from provided fact", async () => {
  const items = [
    {
      _id: "1",
      price: {
        amount: 10
      },
      quantity: 1
    },
    {
      _id: "1",
      price: {
        amount: 2
      },
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
  const total = await totalItemAmount(mockContext, parameters, almanac);
  expect(total).toEqual(14);
});
