import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import mockContext from "/imports/test-utils/helpers/mockContext";
import createAccount from "./createAccount";

mockContext.mutations.createAccount = jest.fn().mockName("mutations.createAccount");

test("correctly passes through to internal mutation function", async () => {
  const additionals = {};
  const shopId = encodeShopOpaqueId("SHOP_ID");
  const tokenObj = {};
  const user = {};

  const fakeResult = { _id: "a1", emails: { address: "new-email@test.com" } };

  mockContext.mutations.createAccount.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await createAccount(null, {
    input: {
      additionals,
      shopId,
      tokenObj,
      user,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.createAccount).toHaveBeenCalledWith(mockContext, { additionals: {}, groupId: null, shopId: "SHOP_ID", tokenObj: {}, user: {} });

  expect(result).toEqual({
    account: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
