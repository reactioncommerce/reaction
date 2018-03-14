import {
  assocInternalId,
  decodeOpaqueId,
  encodeOpaqueId
} from "./id";

const testNamespace = "reaction/accounts";
const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vYWNjb3VudHM6MTIzNDU=";

describe("toInternalId", () => {
  it("returns an object with namespace and id", () => {
    const { namespace, id } = decodeOpaqueId(testOpaqueId);
    expect(namespace).toBe(testNamespace);
    expect(id).toBe(testId);
  });
});

describe("toOpaqueId", () => {
  it("returns an opaque, base64-encoded, namespaced id", () => {
    expect(encodeOpaqueId(testNamespace, testId)).toEqual(testOpaqueId);
  });
});

describe("assocInternalId", () => {
  it("associates an internal ID to an object", () => {
    const input = {
      _id: testOpaqueId,
      foo: "baz"
    };
    expect(assocInternalId(input)).toEqual({
      _id: testId,
      foo: "baz"
    });
  });
});
