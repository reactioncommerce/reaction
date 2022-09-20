import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { encodeShopOpaqueId } from "../../xforms/id.js";
import createAccountGroup from "./createAccountGroup.js";

mockContext.mutations.createAccountGroup = jest.fn().mockName("mutations.createAccountGroup");

test("createAccountGroup resolver function should correctly passes through to internal mutation function", async () => {
  const groupName = "test group";
  const endcodedShopId = encodeShopOpaqueId("test-shop-id");
  const group = {
    name: groupName,
    slug: groupName
  };

  const input = { group, shopId: endcodedShopId, clientMutationId: "clientMutationId" };

  const fakeCreatedGroupResult = {
    group: {
      _id: "test-group-id",
      name: "test group",
      slug: "test group",
      permissions: [
        "dashboard"
      ],
      shopId: endcodedShopId
    }
  };


  mockContext.mutations.createAccountGroup.mockReturnValueOnce(Promise.resolve(fakeCreatedGroupResult));

  const result = await createAccountGroup(null, { input }, mockContext);
  const resolverMutationFunctionInternalInput = { ...input, shopId: "test-shop-id" };

  expect(mockContext.mutations.createAccountGroup).toHaveBeenCalledWith(mockContext, resolverMutationFunctionInternalInput);

  expect(result).toEqual({
    group: {
      _id: "test-group-id",
      name: "test group",
      slug: "test group",
      permissions: [
        "dashboard"
      ],
      shopId: endcodedShopId
    }
  });
});
