import account from "./account";

const base64ID = "cmVhY3Rpb24vYWNjb3VudDoxMjM="; // reaction/account:123

const mockAccount = {
  _id: "123",
  name: "Reaction"
};

test("calls queries.accounts.userAccount and returns the requested user", async () => {
  const userAccount = jest.fn().mockName("queries.accounts.userAccount").mockReturnValueOnce(Promise.resolve(mockAccount));

  const user = await account(null, { id: base64ID }, {
    queries: { accounts: { userAccount } },
    userId: "999"
  });

  expect(user).toEqual(mockAccount);

  expect(userAccount).toHaveBeenCalled();
  expect(userAccount.mock.calls[0][1]).toBe("123");
});
