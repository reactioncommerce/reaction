import {
  assocTagsInternalId,
  assocTagsOpaqueId,
  decodeTagsOpaqueId,
  encodeTagsOpaqueId
} from "./tag";

const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vdGFnOjEyMzQ1";

test("encodeTagsOpaqueId returns an opaque, base64-encoded, Tag-namespaced ID", () => {
  expect(encodeTagsOpaqueId(testId)).toBe(testOpaqueId);
});

test("assocTagsOpaqueId transforms the _id on an object to Tag-namespaced opaque ID", () => {
  const input = {
    _id: testId,
    foo: "baz"
  };
  expect(assocTagsOpaqueId(input)).toEqual({
    _id: testOpaqueId,
    foo: "baz"
  });
});

test("decodeTagsOpaqueId returns the internal ID from opaque ID", () => {
  expect(decodeTagsOpaqueId(testOpaqueId)).toBe(testId);
});

test("assocTagsInternalId transforms the _id on an object from Tag-namespaced opaque ID to internal", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(assocTagsInternalId(input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});
