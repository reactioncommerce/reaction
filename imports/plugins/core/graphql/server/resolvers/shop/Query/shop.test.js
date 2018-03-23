import shop from "./shop";

const id = "cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==";

// TODO: This is just a shell for now
test("returns the shop object", () => {
  const shopObject = shop(null, { id }, {
    queries: {
      shopById: (context, _id) => ({ _id })
    }
  });
  expect(shopObject._id).toBe(id);
});
