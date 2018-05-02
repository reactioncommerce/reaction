import {
  assocTagInternalId,
  assocTagOpaqueId,
  decodeTagOpaqueId,
  encodeTagOpaqueId
} from "./tag";

const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vdGFnOjEyMzQ1";

test("encodeTagOpaqueId returns an opaque, base64-encoded, Tag-namespaced ID", () => {
  expect(encodeTagOpaqueId(testId)).toBe(testOpaqueId);
});

test("assocTagOpaqueId transforms the _id on an object to Tag-namespaced opaque ID", () => {
  const input = {
    _id: testId,
    foo: "baz"
  };
  expect(assocTagOpaqueId(input)).toEqual({
    _id: testOpaqueId,
    foo: "baz"
  });
});

test("decodeTagOpaqueId returns the internal ID from opaque ID", () => {
  expect(decodeTagOpaqueId(testOpaqueId)).toBe(testId);
});

test("assocTagInternalId transforms the _id on an object from Tag-namespaced opaque ID to internal", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(assocTagInternalId(input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});
