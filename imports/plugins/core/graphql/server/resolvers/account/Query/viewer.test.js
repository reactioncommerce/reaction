import viewer from "./viewer";

jest.mock("graphql-fields", () => jest.fn().mockName("graphqlFields"));

test("calls queries.userAccount and returns the viewing user", () => {
  require("graphql-fields").mockReturnValueOnce({ _id: "1", name: "1" });

  const userAccount = jest.fn().mockName("userAccount").mockReturnValueOnce({
    _id: "123",
    name: "Reaction"
  });

  const user = viewer(null, null, {
    queries: { userAccount },
    userId: "123"
  });

  expect(user).toEqual({
    _id: "cmVhY3Rpb24vYWNjb3VudDoxMjM=",
    addressBook: null,
    currency: null,
    name: "Reaction",
    preferences: null
  });

  expect(userAccount).toHaveBeenCalled();
});

test("returns without calling queries.userAccount if only _id requested", () => {
  require("graphql-fields").mockReturnValueOnce({ _id: "1" });

  const userAccount = jest.fn().mockName("userAccount");

  const user = viewer(null, null, {
    queries: { userAccount },
    userId: "123"
  });

  expect(user).toEqual({
    _id: "cmVhY3Rpb24vYWNjb3VudDoxMjM=",
    addressBook: null,
    currency: null,
    preferences: null
  });

  expect(userAccount).not.toHaveBeenCalled();
});
