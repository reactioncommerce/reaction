import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { encodeShopOpaqueId } from "../../xforms/id.js";
import createAccount from "./createAccount.js";

mockContext.mutations.createAccount = jest.fn().mockName("mutations.createAccount");

test("create a new account", async () => {
  const emails = {
    address: "mock-email",
    verified: false
  };
  const encodedShopId = encodeShopOpaqueId("mock-shop-id");
  const input = {
    userId: "mock-user-id",
    shopId: encodedShopId,
    name: "mock-name",
    emails,
    clientMutationId: "mock-client-mutation-id"
  };
  const mockReturn = {
    userId: "mock-user-id",
    shopId: encodedShopId,
    name: "mock-name",
    emails
  };

  mockContext.mutations.createAccount.mockReturnValueOnce(mockReturn);

  const result = await createAccount(null, { input }, mockContext);
  await expect(await result).toEqual({
    account: {
      userId: "mock-user-id",
      shopId: encodedShopId,
      name: "mock-name",
      emails: {
        address: "mock-email",
        verified: false
      }
    },
    clientMutationId: "mock-client-mutation-id"
  });
});
