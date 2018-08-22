import getAbsoluteUrl from "./getAbsoluteUrl";

test("throws error if no host header is provided", () => {
  const requestHeaders = {
    origin: "http://localhost:3000"
  };

  expect(() => getAbsoluteUrl(requestHeaders)).toThrowErrorMatchingSnapshot();
});

test("throws error if no origin header is provided", () => {
  const requestHeaders = {
    host: "localhost:3000"
  };

  expect(() => getAbsoluteUrl(requestHeaders)).toThrowErrorMatchingSnapshot();
});

test("returns the correct absolute url", () => {
  const requestHeaders = {
    origin: "http://localhost:3000",
    host: "localhost:3000"
  };

  expect(getAbsoluteUrl(requestHeaders)).toBe("http://localhost:3000/");
});
