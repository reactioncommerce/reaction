import {
  assocUserInternalId,
  assocUserOpaqueId,
  decodeUserOpaqueId,
  encodeUserOpaqueId
} from "./user";

const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vdXNlcjoxMjM0NQ==";

test("encodeUserOpaqueId returns an opaque, base64-encoded, User-namespaced ID", () => {
  expect(encodeUserOpaqueId(testId)).toBe(testOpaqueId);
});

test("assocUserOpaqueId transforms the _id on an object to User-namespaced opaque ID", () => {
  const input = {
    _id: testId,
    foo: "baz"
  };
  expect(assocUserOpaqueId(input)).toEqual({
    _id: testOpaqueId,
    foo: "baz"
  });
});

test("decodeUserOpaqueId returns the internal ID from opaque ID", () => {
  expect(decodeUserOpaqueId(testOpaqueId)).toBe(testId);
});

test("assocUserInternalId transforms the _id on an object from User-namespaced opaque ID to internal", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(assocUserInternalId(input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});
