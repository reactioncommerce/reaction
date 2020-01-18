import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const createTaxRateMutation = importAsString("./createTaxRateMutation.graphql");
const updateTaxRateMutation = importAsString("./updateTaxRateMutation.graphql");
const deleteTaxRateMutation = importAsString("./deleteTaxRateMutation.graphql");

jest.setTimeout(300000);

let createTaxRate;
let mockAdminAccount;
let deleteTaxRate;
let shopId;
let shopOpaqueId;
let testApp;
let taxRateOpaqueId;
let updateTaxRate;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  createTaxRate = testApp.mutate(createTaxRateMutation);
  updateTaxRate = testApp.mutate(updateTaxRateMutation);
  deleteTaxRate = testApp.mutate(deleteTaxRateMutation);

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:taxRates/create", "reaction:legacy:taxRates/delete", "reaction:legacy:taxRates/read", "reaction:legacy:taxRates/update"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);
});

afterAll(async () => {
  await testApp.collections.Taxes.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Groups.deleteMany({});
  await testApp.stop();
});

test("user can add a tax rate", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const taxRateInput = {
    shopId: shopOpaqueId,
    region: "CA",
    rate: 0.10,
    country: "USA",
    postal: "90066",
    taxCode: "CODE"
  };

  let result;
  try {
    result = await createTaxRate(taxRateInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: createdTaxRateOpaqueId, ...createdTaxRate } = result.createTaxRate.taxRate;

  // Save this for the next tests for updating and deleting;
  taxRateOpaqueId = createdTaxRateOpaqueId;

  // Validate the response
  // _id is omitted since the ID is tested for proper opaque ID conversion in the DB test below.
  const expectedTaxRateResponse = {
    shop: {
      _id: shopOpaqueId
    },
    region: "CA",
    rate: 0.10,
    country: "USA",
    postal: "90066",
    sourcing: "destination",
    taxCode: "CODE"
  };

  expect(createdTaxRate).toEqual(expectedTaxRateResponse);

  // Check the database for the new TaxRate document
  const createdTaxRateDatabaseId = decodeOpaqueIdForNamespace("reaction/taxRate")(createdTaxRateOpaqueId);

  const savedTaxRate = await testApp.collections.Taxes.findOne({
    _id: createdTaxRateDatabaseId,
    shopId
  });

  // The document we expect to see in the database
  const expectedTaxRateDocument = {
    _id: createdTaxRateDatabaseId,
    shopId,
    region: "CA",
    rate: 0.10,
    country: "USA",
    postal: "90066",
    taxCode: "CODE",
    taxLocale: "destination"
  };

  expect(savedTaxRate).toEqual(expectedTaxRateDocument);
});

test("user can update an existing tax rate", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const taxRateInput = {
    taxRateId: taxRateOpaqueId,
    shopId: shopOpaqueId,
    region: "CA",
    rate: 0.40,
    country: "USA",
    postal: "90210",
    taxCode: "CODE"
  };

  let result;
  try {
    result = await updateTaxRate(taxRateInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: updatedTaxRateOpaqueId, ...updatedTaxRate } = result.updateTaxRate.taxRate;

  // Validate the response
  // _id is omitted since the ID is tested for proper opaque ID conversion in the DB test below.
  const expectedTaxRateResponse = {
    shop: {
      _id: shopOpaqueId
    },
    region: "CA",
    rate: 0.40,
    country: "USA",
    postal: "90210",
    sourcing: "destination",
    taxCode: "CODE"
  };

  expect(updatedTaxRate).toEqual(expectedTaxRateResponse);

  // Check the database for the new TaxRate document
  const updatedTaxRateDatabaseId = decodeOpaqueIdForNamespace("reaction/taxRate")(updatedTaxRateOpaqueId);

  const savedTaxRate = await testApp.collections.Taxes.findOne({
    _id: updatedTaxRateDatabaseId,
    shopId
  });

  // The document we expect to see in the database
  const expectedTaxRateDocument = {
    _id: updatedTaxRateDatabaseId,
    shopId,
    region: "CA",
    rate: 0.40,
    country: "USA",
    postal: "90210",
    taxCode: "CODE",
    taxLocale: "destination"
  };

  expect(savedTaxRate).toEqual(expectedTaxRateDocument);
});

test("user can update an existing tax rate to clear all fields except rate", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const taxRateInput = {
    shopId: shopOpaqueId,
    region: "CA",
    rate: 0.10,
    country: "USA",
    postal: "90066",
    taxCode: "CODE"
  };

  let result;
  try {
    result = await createTaxRate(taxRateInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: createdTaxRateOpaqueId } = result.createTaxRate.taxRate;

  const taxRateUpdateInput = {
    taxRateId: createdTaxRateOpaqueId,
    shopId: shopOpaqueId,
    rate: 0.40
  };

  try {
    result = await updateTaxRate(taxRateUpdateInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: updatedTaxRateOpaqueId, ...updatedTaxRate } = result.updateTaxRate.taxRate;

  // Validate the response
  // _id is omitted since the ID is tested for proper opaque ID conversion in the DB test below.
  const expectedTaxRateResponse = {
    shop: {
      _id: shopOpaqueId
    },
    region: null,
    rate: 0.40,
    country: null,
    postal: null,
    sourcing: "destination",
    taxCode: null
  };

  expect(updatedTaxRate).toEqual(expectedTaxRateResponse);

  // Check the database for the new TaxRate document
  const updatedTaxRateDatabaseId = decodeOpaqueIdForNamespace("reaction/taxRate")(updatedTaxRateOpaqueId);

  const savedTaxRate = await testApp.collections.Taxes.findOne({
    _id: updatedTaxRateDatabaseId,
    shopId
  });

  // The document we expect to see in the database
  const expectedTaxRateDocument = {
    _id: updatedTaxRateDatabaseId,
    shopId,
    region: null,
    rate: 0.40,
    country: null,
    postal: null,
    taxCode: null,
    taxLocale: "destination"
  };

  expect(savedTaxRate).toEqual(expectedTaxRateDocument);
});

test("user can delete an existing tax rate", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const taxRateInput = {
    taxRateId: taxRateOpaqueId,
    shopId: shopOpaqueId
  };

  let result;
  try {
    result = await deleteTaxRate(taxRateInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: deletedTaxRateOpaqueId, ...deletedTaxRate } = result.deleteTaxRate.taxRate;

  // Validate the response
  // _id is omitted since the ID is tested for proper opaque ID conversion in the DB test below.
  const expectedTaxRateResponse = {
    shop: {
      _id: shopOpaqueId
    },
    region: "CA",
    rate: 0.40,
    country: "USA",
    postal: "90210",
    sourcing: "destination",
    taxCode: "CODE"
  };

  expect(deletedTaxRate).toEqual(expectedTaxRateResponse);

  // Check the database for the new TaxRate document
  const deletedTaxRateDatabaseId = decodeOpaqueIdForNamespace("reaction/taxRate")(deletedTaxRateOpaqueId);

  const savedTaxRate = await testApp.collections.Taxes.findOne({
    _id: deletedTaxRateDatabaseId,
    shopId
  });

  // Expect the tax rate to be removed from the database
  expect(savedTaxRate).toBeNull();
});
