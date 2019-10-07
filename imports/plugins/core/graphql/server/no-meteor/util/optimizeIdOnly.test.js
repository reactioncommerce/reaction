import optimizeIdOnly from "./optimizeIdOnly.js";

jest.mock("graphql-fields", () => jest.fn().mockName("graphqlFields"));

test("returns the given query function if the GraphQL request is asking for more than just _id", () => {
  require("graphql-fields").mockReturnValueOnce({ _id: "1", name: "1" });
  expect(optimizeIdOnly("KNOWN_ID", {}, () => "ORIGINAL")()).toBe("ORIGINAL");
});

test("returns a replacement query function if the GraphQL request is asking for only _id", async () => {
  require("graphql-fields").mockReturnValueOnce({ _id: "1" });
  expect(await optimizeIdOnly("KNOWN_ID", {}, () => "ORIGINAL")()).toEqual({ _id: "KNOWN_ID" });
});
