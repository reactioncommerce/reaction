import {
  assocInternalId,
  assocOpaqueId,
  decodeOpaqueId,
  decodeOpaqueIdForNamespace,
  encodeOpaqueId
} from "./id";

const testNamespace = "reaction/accounts";
const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vYWNjb3VudHM6MTIzNDU=";

test("decodeOpaqueId returns an object with namespace and ID", () => {
  const { namespace, id } = decodeOpaqueId(testOpaqueId);
  expect(namespace).toBe(testNamespace);
  expect(id).toBe(testId);
});

test("decodeOpaqueId returns null if opaqueId is undefined", () => {
  const decodedId = decodeOpaqueId(undefined);
  expect(decodedId).toBe(null);
});

test("decodeOpaqueId returns null if opaqueId is null", () => {
  const decodedId = decodeOpaqueId(null);
  expect(decodedId).toBe(null);
});

test("decodeOpaqueIdForNamespace returns just the ID", () => {
  const id = decodeOpaqueIdForNamespace(testNamespace, testOpaqueId);
  expect(id).toBe(testId);
});

test("decodeOpaqueIdForNamespace returns null if opaqueId is undefined", () => {
  const result = decodeOpaqueIdForNamespace(testNamespace, undefined);
  expect(result).toBe(null);
});

test("decodeOpaqueIdForNamespace returns null if opaqueId is null", () => {
  const result = decodeOpaqueIdForNamespace(testNamespace, null);
  expect(result).toBe(null);
});

test("decodeOpaqueIdForNamespace throws an error if the namespace is incorrect", () => {
  expect(() => {
    decodeOpaqueIdForNamespace("foo", testOpaqueId);
  }).toThrowError("ID namespace must be foo");
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

test("assocInternalId associates an internal _id to an object", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(assocInternalId(testNamespace, input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});

test("assocOpaqueId associates an opaque _id to an object", () => {
  const input = {
    _id: testId,
    foo: "baz"
  };
  expect(assocOpaqueId(testNamespace, input)).toEqual({
    _id: testOpaqueId,
    foo: "baz"
  });
});
