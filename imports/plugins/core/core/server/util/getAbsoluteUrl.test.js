import getAbsoluteUrl from "./getAbsoluteUrl";

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
