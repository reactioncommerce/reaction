import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import incrementSequence from "./incrementSequence.js";

test("incrementSequence returns a correct number", async () => {
  mockContext.collections = {
    Sequences: {
      findOneAndUpdate: jest.fn().mockReturnValueOnce(Promise.resolve({
        value: {
          value: 1
        }
      }))
    }
  };

  const result = await incrementSequence(mockContext, "SHOP_ID", "ENTITY");
  expect(result).toEqual(1);
});
