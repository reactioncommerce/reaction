import isOpaqueId from "./isOpaqueId.js";

test("returns true for opaqueId", () => {
  const encodedId = "cmVhY3Rpb24vc2hvcDpieTV3cGRnM25NcThnWDU0Yw==";
  expect(isOpaqueId(encodedId)).toEqual(true);
});

test("returns false for internal id", () => {
  const id = "by5wpdg3nMq8gX54c";
  expect(isOpaqueId(id)).toEqual(false);
});
