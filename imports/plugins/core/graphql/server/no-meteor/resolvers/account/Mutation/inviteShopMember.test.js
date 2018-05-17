import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import inviteShopMember from "./inviteShopMember";

test("correctly passes through to accounts/inviteShopMember method", () => {
  const groupId = encodeGroupOpaqueId("g1");
  const shopId = encodeShopOpaqueId("s1");

  const account = { name: "test name", addressBook: null, currency: null, preferences: null };

  const fakeResult = { _id: "1", ...account };

  const mockMethod = jest.fn().mockName("accounts/inviteShopMember method");
  mockMethod.mockReturnValueOnce(fakeResult);
  const context = {
    callMeteorMethod: mockMethod
  };

  const result = inviteShopMember(null, {
    input: {
      email: "test@email.com",
      groupId,
      name: "test name",
      shopId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(mockMethod).toHaveBeenCalledWith("accounts/inviteShopMember", {
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
