import getUserId from "./getUserId";

test("returns the user ID from the context", () => {
  const userId = getUserId(null, null, { user: { _id: "123" } });
  expect(userId).toBe("123");
});

test("throws an access denied error if no user in context", () => {
  expect(() => getUserId(null, null, {})).toThrow("access-denied");
});
