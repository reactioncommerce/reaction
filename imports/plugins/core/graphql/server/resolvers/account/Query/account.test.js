import account from "./account";

const mockAccount = {
  _id: "123",
  name: "Reaction"
};

test("calls queries.userAccount and returns the requested user", async () => {
  const userAccount = jest.fn().mockName("queries.userAccount").mockReturnValueOnce(Promise.resolve(mockAccount));

  const user = await account(null, { id: mockAccount._id }, {
    queries: { userAccount },
    userId: "999"
  });

  expect(user).toEqual(mockAccount);

  expect(userAccount).toHaveBeenCalled();
  expect(userAccount.mock.calls[0][1]).toBe("123");
});
