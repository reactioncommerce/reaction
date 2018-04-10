import shop from "./shop";

const fakeUser = {
  _id: "123",
  name: "Bob Builder",
  shopId: "W64ZQe9RUMuAoKrli" // encoded shopId is: cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==
};

test("calls queries.shopById and returns the requested shop", async () => {
  const shopById = jest.fn().mockName("shopById").mockReturnValueOnce(Promise.resolve({
    _id: fakeUser.shopId,
    name: "Reaction"
  }));

  const shopObject = await shop(fakeUser, {}, { queries: { shopById } });

  expect(shopObject).toEqual({
    _id: "cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==",
    name: "Reaction"
  });

  expect(shopById).toHaveBeenCalled();
  expect(shopById.mock.calls[0][1]).toBe(fakeUser.shopId);
});
