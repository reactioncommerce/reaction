import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import TestApp from "../TestApp";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

let shopQuery;
let shopId;
let testApp;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  shopId = await testApp.insertPrimaryShop();

  shopQuery = testApp.query(`($id: ID!) {
  shop(id: $id) {
    _id
    currencies {
      code
    }
    currency {
      code
    }
    description
    name
  }
}`);
});

afterAll(() => testApp.stop());

test("get shop, no auth necessary", async () => {
  const opaqueShopId = encodeShopOpaqueId(shopId);
  const result = await shopQuery({ id: opaqueShopId });
  expect(result).toEqual({
    shop: {
      _id: opaqueShopId,
      currencies: [
        { code: "USD" }
      ],
      currency: { code: "USD" },
      description: "mockDescription",
      name: "Primary Shop"
    }
  });
});
