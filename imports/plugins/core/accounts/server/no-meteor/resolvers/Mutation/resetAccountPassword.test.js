import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import mockContext from "/imports/test-utils/helpers/mockContext";
import sendResetAccountPasswordEmail from "./sendResetAccountPasswordEmail";

mockContext.mutations.sendResetAccountPasswordEmail = jest.fn().mockName("mutations.sendResetAccountPasswordEmail");

test("correctly passes through to internal mutation function", async () => {
  const groupId = encodeGroupOpaqueId("g1");
  const shopId = encodeShopOpaqueId("s1");

  const account = { name: "test name", addressBook: null, currency: null, preferences: null };

  const fakeResult = { _id: "1", ...account };

  mockContext.mutations.sendResetAccountPasswordEmail.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await sendResetAccountPasswordEmail(null, {
    input: {
      email: "test@email.com",
      groupId,
      name: "test name",
      shopId,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.sendResetAccountPasswordEmail).toHaveBeenCalledWith(mockContext, {
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
