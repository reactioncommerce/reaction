import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import checkCartForPromotionChange from "./checkCartForPromotionChange.js";

const existingCart = {
  appliedPromotions: {
    updatedAt: new Date(),
    _id: "promotion1"
  }
};

const mockSaveCart = jest.fn();
jest.mock("./applyPromotions");

mockContext.mutations = {
  saveCart: mockSaveCart
};

mockContext.collections.Carts = mockCollection("Carts");
mockContext.collections.Carts.findOne.mockReturnValueOnce(Promise.resolve(existingCart));

test("should trigger a saveCart mutation when the cart has changed", async () => {
  const checkCart = checkCartForPromotionChange(mockContext);
  const results = await checkCart(["cartId"]);
  console.log("results", results);
});
