import getAbsoluteUrl from "./getAbsoluteUrl.js";

test("returns the correct URL when given an empty path", () => {
  const rootUrl = "http://localhost:3000/";
  const path = "";
  expect(getAbsoluteUrl(rootUrl, path)).toBe(rootUrl);
});

test("returns the correct URL when given a path", () => {
  const rootUrl = "http://localhost:3000/";
  const path = "/media/test.jpg";
  expect(getAbsoluteUrl(rootUrl, path)).toBe("http://localhost:3000/media/test.jpg");
});

test("returns the correct URL if the path already contains the rootUrl", () => {
  const rootUrl = "http://localhost:3000/";
  const path = "http://localhost:3000/media/test.jpg";
  expect(getAbsoluteUrl(rootUrl, path)).toBe("http://localhost:3000/media/test.jpg");
});

test("returns the correct URL for 3rd party services", () => {
  const rootUrl = "http://localhost:3000/";
  const path = "https://cloudinary.com/media/test.jpg";
  expect(getAbsoluteUrl(rootUrl, path)).toBe("https://cloudinary.com/media/test.jpg");
});

test("returns the correct URL for protocol-relative URLs", () => {
  const rootUrl = "http://localhost:3000/";
  const path = "//example.com/img/logo.jpg";
  expect(getAbsoluteUrl(rootUrl, path)).toBe("//example.com/img/logo.jpg");
});

test("returns the correct URL for path starting with http", () => {
  const rootUrl = "http://localhost:3000/";
  const path = "http.jpg";
  expect(getAbsoluteUrl(rootUrl, path)).toBe("http://localhost:3000/http.jpg");
});
