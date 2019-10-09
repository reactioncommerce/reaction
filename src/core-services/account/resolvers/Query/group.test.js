import group from "./group.js";

const base64ID = "cmVhY3Rpb24vZ3JvdXA6YWJjMTMyMQ=="; // reaction/group:abc1321

const mockGroup = {
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
};

test("calls queries.group with a group id should return a group", async () => {
  const groupQuery = jest.fn().mockName("queries.group").mockReturnValueOnce(Promise.resolve(mockGroup));

  const result = await group(null, { id: base64ID }, {
    queries: { group: groupQuery },
    userId: "123"
  });

  expect(result).toEqual(mockGroup);
  expect(groupQuery).toHaveBeenCalled();
});
