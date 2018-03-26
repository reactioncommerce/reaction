import account from "./account";

const base64ID = "cmVhY3Rpb24vYWNjb3VudDoxMjM="; // reaction/account:123

test("calls queries.userAccount and returns the requested user", () => {
  const userAccount = jest.fn().mockName("userAccount").mockReturnValueOnce({
    _id: "123",
    name: "Reaction"
  });

  const user = account(null, { id: base64ID }, {
    queries: { userAccount },
    userId: "999"
  });

  expect(user).toEqual({
    _id: "cmVhY3Rpb24vYWNjb3VudDoxMjM=",
    addressBook: null,
    currency: null,
    name: "Reaction",
    preferences: null
  });

  expect(userAccount).toHaveBeenCalled();
  expect(userAccount.mock.calls[0][1]).toBe("123");
});
