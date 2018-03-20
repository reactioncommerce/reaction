import {
  assocInternalId,
  decodeOpaqueId,
  encodeOpaqueId
} from "./id";

const testNamespace = "reaction/accounts";
const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vYWNjb3VudHM6MTIzNDU=";

test("decodeOpaqueId returns an object with namespace and id", () => {
  const { namespace, id } = decodeOpaqueId(testOpaqueId);
  expect(namespace).toBe(testNamespace);
  expect(id).toBe(testId);
});

test("encodeOpaqueId returns an opaque, base64-encoded, namespaced id", () => {
  expect(encodeOpaqueId(testNamespace, testId)).toBe(testOpaqueId);
});

test("encodeOpaqueId passes through undefined", () => {
  expect(encodeOpaqueId(testNamespace, undefined)).toBe(undefined);
});

test("encodeOpaqueId passes through null", () => {
  expect(encodeOpaqueId(testNamespace, null)).toBe(null);
});

test("assocInternalId associates an internal ID to an object", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(assocInternalId(testNamespace, input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});
