import decodeOpaqueId from "./decodeOpaqueId.js";

test("decodes base64", () => {
  const encodedId = "cmVhY3Rpb24vc2hvcDpieTV3cGRnM25NcThnWDU0Yw==";
  expect(decodeOpaqueId(encodedId)).toEqual({
    id: "by5wpdg3nMq8gX54c",
    namespace: "reaction/shop"
  });
});

test("passes through non-base64", () => {
  const id = "by5wpdg3nMq8gX54c";
  expect(decodeOpaqueId(id)).toEqual({
    id,
    namespace: null
  });
});
