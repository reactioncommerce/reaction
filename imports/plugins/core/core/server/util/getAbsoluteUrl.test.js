import getAbsoluteUrl from "./getAbsoluteUrl";

test("returns process.env.ROOT_URL with trailing slash if set", () => {
  process.env.ROOT_URL = "http://localhost:3000";
  const request = {
    protocol: "https",
    hostname: "reaction-api"
  };

  expect(getAbsoluteUrl(request)).toBe("http://localhost:3000/");
});

test("returns correct URL if process.env.ROOT_URL is not set", () => {
  process.env.ROOT_URL = "";
  const request = {
    protocol: "https",
    hostname: "abc.com"
  };

  expect(getAbsoluteUrl(request)).toBe("https://abc.com/");
});
