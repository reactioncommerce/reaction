import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { encodeShopOpaqueId } from "../../xforms/id.js";
import createGroup from "./createGroup.js";

mockContext.mutations.createGroup = jest.fn().mockName("mutations.createGroup");

test("createGroup resolver function should correctly passes through to internal mutation function", async () => {
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


  mockContext.mutations.createGroup.mockReturnValueOnce(Promise.resolve(fakeCreatedGroupResult));

  const result = await createGroup(null, { input }, mockContext);
  const resolverMutationFunctionInternalInput = Object.assign({}, input, { shopId: "test-shop-id" });

  expect(mockContext.mutations.createGroup).toHaveBeenCalledWith(resolverMutationFunctionInternalInput, mockContext);

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
