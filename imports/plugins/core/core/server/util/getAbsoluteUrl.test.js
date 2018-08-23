import getAbsoluteUrl from "./getAbsoluteUrl";

test("returns empty string if no host header is provided", () => {
  const requestHeaders = {};

  expect(getAbsoluteUrl(requestHeaders, "http")).toBe("");
});

test("returns the correct absolute url", () => {
  const requestHeaders = {
    host: "localhost:3000"
  };

  expect(getAbsoluteUrl(requestHeaders, "https")).toBe("https://localhost:3000/");
});
