import viewer from "./viewer.js";

jest.mock("graphql-fields", () => jest.fn().mockName("graphqlFields"));

const mockAccount = {
  _id: "123",
  name: "Reaction"
};

test("calls queries.userAccount and returns the viewing user", async () => {
  require("graphql-fields").mockReturnValueOnce({ _id: "1", name: "1" }); // eslint-disable-line no-undef

  const userAccount = jest.fn().mockName("queries.userAccount").mockReturnValueOnce(Promise.resolve(mockAccount));

  const account = await viewer(null, null, {
    accountId: "123",
    queries: { userAccount }
  });

  expect(account).toEqual(mockAccount);
});

test("returns without calling queries.userAccount if only _id requested", async () => {
  require("graphql-fields").mockReturnValueOnce({ _id: "1" }); // eslint-disable-line no-undef

  const userAccount = jest.fn().mockName("userAccount");

  const account = await viewer(null, null, {
    accountId: "123",
    queries: { userAccount }
  });

  expect(account).toEqual({ _id: "123" });

  expect(userAccount).not.toHaveBeenCalled();
});
