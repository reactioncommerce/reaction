import shop from "./shop";

const fakeUser = {
  _id: "123",
  name: "Bob Builder",
  shopId: "W64ZQe9RUMuAoKrli"
};

test("returns the shop object from the context", () => {
  const shopObject = shop(fakeUser);
  expect(shopObject._id).toBe("W64ZQe9RUMuAoKrli");
});
