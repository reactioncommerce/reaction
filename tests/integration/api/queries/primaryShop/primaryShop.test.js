import TestApp from "/imports/test-utils/helpers/TestApp";

jest.setTimeout(300000);

const internalShopId = "123";
const shopName = "Test Shop";

let primaryShopQuery;
let testApp;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  primaryShopQuery = testApp.query(`query {
    primaryShop {
        name
    }
  }`);
});

afterAll(() => testApp.stop());

test("get primaryShop, no auth necessary", async () => {
  const result = await primaryShopQuery();
  expect(result).toEqual({
    primaryShop: {
      name: shopName
    }
  });
});
