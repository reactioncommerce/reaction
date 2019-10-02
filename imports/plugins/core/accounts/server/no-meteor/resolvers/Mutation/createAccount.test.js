import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeUserOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/user";
import mockContext from "/imports/test-utils/helpers/mockContext";
import createAccount from "./createAccount";

mockContext.mutations.createAccount = jest.fn().mockName("mutations.createAccount");

test("correctly passes through to internal mutation function", async () => {
  const bio = "Bio: mock string";
  const name = "Name: mock string";
  const picture = "Picture: mock string";
  const shopId = encodeShopOpaqueId("SHOP_ID");
  const userId = encodeUserOpaqueId("USER_ID");
  const username = "Username: mock string";
  const verificationToken = "VerificationToken";

  const fakeResult = { _id: "a1", emails: { address: "new-email@test.com" } };

  mockContext.mutations.createAccount.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await createAccount(null, {
    input: {
      bio,
      name,
      picture,
      shopId,
      userId,
      username,
      verificationToken,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.createAccount).toHaveBeenCalledWith(mockContext, {
    bio,
    name,
    picture,
    shopId: "SHOP_ID",
    userId: "USER_ID",
    username,
    verificationToken
  });

  expect(result).toEqual({
    account: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
