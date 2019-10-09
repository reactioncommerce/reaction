import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import inviteShopMember from "./inviteShopMember.js";

mockContext.mutations.inviteShopMember = jest.fn().mockName("mutations.inviteShopMember");

test("correctly passes through to internal mutation function", async () => {
  const groupId = encodeGroupOpaqueId("g1");
  const shopId = encodeShopOpaqueId("s1");

  const account = { name: "test name", addressBook: null, currency: null, preferences: null };

  const fakeResult = { _id: "1", ...account };

  mockContext.mutations.inviteShopMember.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await inviteShopMember(null, {
    input: {
      email: "test@email.com",
      groupId,
      name: "test name",
      shopId,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.inviteShopMember).toHaveBeenCalledWith(mockContext, {
    email: "test@email.com",
    groupId: "g1",
    name: "test name",
    shopId: "s1"
  });

  expect(result).toEqual({
    account: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
