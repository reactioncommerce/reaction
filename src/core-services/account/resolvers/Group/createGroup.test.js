import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createGroup from "./createGroup.js";

mockContext.mutations.createGroup = jest.fn().mockName("mutations.createGroup");

test("createGroup resolver function should correctly passes through to internal mutation function", async () => {
  const groupName = "test group";
  const shopId = "test-shop-id";
  const group = {
    name: groupName,
    slug: groupName
  };

  const input = { group, shopId, clientMutationId: "clientMutationId" };

  const fakeCreatedGroupResult = {
    group: {
      _id: "test-group-id",
      name: "test group",
      slug: "test group",
      permissions: [
        "dashboard"
      ],
      shopId: "test-shop-id"
    },
    status: 200
  };


  mockContext.mutations.createGroup.mockReturnValueOnce(Promise.resolve(fakeCreatedGroupResult));

  const result = await createGroup(null, {
    input: {
      shopId,
      group,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.createGroup).toHaveBeenCalledWith(input, mockContext);

  expect(result).toEqual({
    group: {
      _id: "test-group-id",
      name: "test group",
      slug: "test group",
      permissions: [
        "dashboard"
      ],
      shopId: "test-shop-id"
    },
    status: 200
  });
});
