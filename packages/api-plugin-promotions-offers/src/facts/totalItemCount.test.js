import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import totalItemCount from "./totalItemCount.js";


test("should return correct total item count", async () => {
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
  const almanac = {
    factValue: jest.fn().mockImplementation((fact) => {
      if (fact === "eligibleItems") {
        return Promise.resolve(items);
      }
      return null;
    })
  };
  const total = await totalItemCount(mockContext, undefined, almanac);
  expect(total).toEqual(3);
});
