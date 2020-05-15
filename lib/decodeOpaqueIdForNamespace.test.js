import decodeOpaqueIdForNamespace from "./decodeOpaqueIdForNamespace.js";

test("decodes base64", () => {
  const encodedId = "cmVhY3Rpb24vc2hvcDpieTV3cGRnM25NcThnWDU0Yw==";
  expect(decodeOpaqueIdForNamespace("reaction/shop", encodedId)).toBe("by5wpdg3nMq8gX54c");
});

test("passes through non-base64", () => {
  const id = "by5wpdg3nMq8gX54c";
  expect(decodeOpaqueIdForNamespace("reaction/shop", id)).toBe(id);
});

test("throws if base64 and namespace is wrong", () => {
  const encodedId = "cmVhY3Rpb24vcHJvZHVjdDpieTV3cGRnM25NcThnWDU0Yw==";
  expect(() => decodeOpaqueIdForNamespace("reaction/shop", encodedId)).toThrow("ID namespace must be reaction/shop");
});
