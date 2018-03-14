import { map } from "ramda";
import {
  assocAccountOpaqueId,
  encodeAccountOpaqueId,
  xformAccountResponse
} from "./account";

const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vYWNjb3VudDoxMjM0NQ==";

test("encodeAccountOpaqueId returns an opaque, base64-encoded, Account namespaced id", () => {
  expect(encodeAccountOpaqueId(testId)).toEqual(testOpaqueId);
});

test("assocAcountOpaqueId returns an Account-namespaced, opaque ID to an object", () => {
  const input = {
    _id: testId,
    foo: "baz"
  };
  expect(assocAccountOpaqueId(input)).toEqual({
    _id: testOpaqueId,
    foo: "baz"
  });
});

// Not actually in code to test, but demonstrates a map with curried fn.
test("example map over Account array", () => {
  const input = [
    { _id: "00000", foo: "bar" },
    { _id: "11111", foo: "baz" },
    { _id: "22222", foo: "boo" }
  ];
  expect(map(assocAccountOpaqueId, input)).toEqual([
    { _id: "cmVhY3Rpb24vYWNjb3VudDowMDAwMA==", foo: "bar" },
    { _id: "cmVhY3Rpb24vYWNjb3VudDoxMTExMQ==", foo: "baz" },
    { _id: "cmVhY3Rpb24vYWNjb3VudDoyMjIyMg==", foo: "boo" }
  ]);
});

const accountInput = {
  _id: "00000",
  acceptsMarketing: true,
  createdAt: "2018-03-13T00:00:00Z",
  emails: [
    { provides: "default", address: "test@example.com", verified: true }
  ],
  groups: { type: "GroupConnection" },
  metafields: [{ type: "Metafield" }],
  name: "User Name",
  note: "This is a note.",
  profile: {
    addressBook: { type: "AddressConnection" },
    currency: { type: "Currency" },
    preferences: { foo: "baz" }
  },
  sessions: ["1", "2", "3"],
  shop: { type: "Shop" },
  state: "new",
  taxSettings: { type: "TaxSettings" },
  updatedAt: "2018-03-13T00:00:00Z",
  user: { type: "User" },
  username: "username"
};

const expectedResponse = {
  _id: "cmVhY3Rpb24vYWNjb3VudDowMDAwMA==",
  addressBook: { type: "AddressConnection" },
  createdAt: "2018-03-13T00:00:00Z",
  emailRecords: [
    { provides: "default", address: "test@example.com", verified: true }
  ],
  currency: { type: "Currency" },
  groups: { type: "GroupConnection" },
  metafields: [{ type: "Metafield" }],
  name: "User Name",
  note: "This is a note.",
  preferences: { foo: "baz" },
  shop: { type: "Shop" },
  updatedAt: "2018-03-13T00:00:00Z",
  user: { type: "User" }
};

test("xformAccountResponse transforms internal account to response schema", () => {
  expect(xformAccountResponse(accountInput)).toEqual(expectedResponse);
});

test("xformAccountResponse can be applied to map with an array of input", () => {
  expect(map(xformAccountResponse, [accountInput])).toEqual([expectedResponse]);
});
