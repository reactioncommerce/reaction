import group from "./group";

const base64ID = "cmVhY3Rpb24vZ3JvdXA6YWJjMTMyMQ=="; // reaction/group:abc1321

test("calls queries.group with a group id should return a group", async () => {
  const groupQuery = jest.fn().mockName("groupQuery").mockReturnValueOnce(Promise.resolve({
    _id: "abc1321",
    name: "shop manager",
    slug: "shop-manager",
    permissions: [
      "core",
      "createProduct",
      "dashboard"
    ],
    shopId: "J8Bhq3uTtdgwZx3rz",
    createdAt: "2018-03-21T21:36:36.307Z",
    updatedAt: "2018-03-22T18:17:22.342Z"
  }));

  const result = await group(null, { id: base64ID }, {
    queries: { group: groupQuery },
    userId: "123"
  });

  expect(result._id).toBe(base64ID);
  expect(groupQuery).toHaveBeenCalled();
});
