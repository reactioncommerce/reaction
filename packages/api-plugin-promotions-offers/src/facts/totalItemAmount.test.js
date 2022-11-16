import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import totalItemAmount from "./totalItemAmount.js";


test("should return correct total item amount", async () => {
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
  const almanac = {
    factValue: jest.fn().mockImplementation((fact) => {
      if (fact === "eligibleItems") {
        return Promise.resolve(items);
      }
      return null;
    })
  };
  const total = await totalItemAmount(mockContext, undefined, almanac);
  expect(total).toEqual(14);
});
