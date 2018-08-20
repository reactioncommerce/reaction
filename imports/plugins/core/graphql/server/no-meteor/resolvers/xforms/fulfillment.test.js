import {
  assocFulfillmentMethodInternalId,
  assocFulfillmentMethodOpaqueId,
  decodeFulfillmentMethodOpaqueId,
  encodeFulfillmentMethodOpaqueId
} from "./fulfillment";

const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vZnVsZmlsbG1lbnRNZXRob2Q6MTIzNDU=";

test("encodeFulfillmentMethodOpaqueId returns an opaque, base64-encoded, FulfillmentMethod-namespaced ID", () => {
  expect(encodeFulfillmentMethodOpaqueId(testId)).toBe(testOpaqueId);
});

test("assocFulfillmentMethodOpaqueId transforms the _id on an object to FulfillmentMethod-namespaced opaque ID", () => {
  const input = {
    _id: testId,
    foo: "baz"
  };
  expect(assocFulfillmentMethodOpaqueId(input)).toEqual({
    _id: testOpaqueId,
    foo: "baz"
  });
});

test("decodeFulfillmentMethodOpaqueId returns the internal ID from opaque ID", () => {
  expect(decodeFulfillmentMethodOpaqueId(testOpaqueId)).toBe(testId);
});

test("assocFulfillmentMethodInternalId transforms the _id on an object from FulfillmentMethod-namespaced opaque ID to internal", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(assocFulfillmentMethodInternalId(input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});
