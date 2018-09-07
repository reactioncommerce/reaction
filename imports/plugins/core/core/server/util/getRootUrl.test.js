import getRootUrl from "./getRootUrl";

test("returns process.env.ROOT_URL with trailing slash if set", () => {
  process.env.ROOT_URL = "http://localhost:3000";
  const request = {
    protocol: "https",
    hostname: "graphql.reaction.localhost"
  };

  expect(getRootUrl(request)).toBe("http://localhost:3000/");
});

test("returns correct root URL if process.env.ROOT_URL is not set", () => {
  process.env.ROOT_URL = "";
  const request = {
    protocol: "https",
    hostname: "abc.com"
  };

  expect(getRootUrl(request)).toBe("https://abc.com/");
});
