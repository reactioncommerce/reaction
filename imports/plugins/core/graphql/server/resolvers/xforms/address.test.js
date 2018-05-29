import {
  assocAddressInternalId,
  assocAddressOpaqueId,
  decodeAddressOpaqueId,
  encodeAddressOpaqueId,
  xformAddressInput
} from "./address";

const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vYWRkcmVzczoxMjM0NQ==";

test("encodeAddressOpaqueId returns an opaque, base64-encoded, Address-namespaced ID", () => {
  expect(encodeAddressOpaqueId(testId)).toBe(testOpaqueId);
});

test("assocAddressOpaqueId transforms the _id on an object to Address-namespaced opaque ID", () => {
  const input = {
    _id: testId,
    foo: "baz"
  };
  expect(assocAddressOpaqueId(input)).toEqual({
    _id: testOpaqueId,
    foo: "baz"
  });
});

test("decodeAddressOpaqueId returns the internal ID from opaque ID", () => {
  expect(decodeAddressOpaqueId(testOpaqueId)).toBe(testId);
});

test("assocAddressInternalId transforms the _id on an object from Address-namespaced opaque ID to internal", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(assocAddressInternalId(input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});

test("xformAddressInput transforms an input address to internal schema with internal IDs", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(xformAddressInput(input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});
