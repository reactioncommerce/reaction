import shop from "./shop";

const fakeUser = {
  _id: "123",
  name: "Bob Builder",
  shopId: "W64ZQe9RUMuAoKrli" // encoded shopId is: cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==
};


test("returns the shop object from the context", () => {
  const shopObject = shop(fakeUser);
  expect(shopObject._id).toBe("cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==");
});
