import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";

jest.setTimeout(300000);

const shopId = "integ-test-shop-id";
const accountId = "integ-test-account-id";
const opaqueAccountId = "cmVhY3Rpb24vYWNjb3VudDppbnRlZy10ZXN0LWFjY291bnQtaWQ=";
const orderId = "integ-test-order-id";

const mockAccount = Factory.Account.makeOne({
  _id: accountId
});

const ordersByAccountIdQuery = `query ($accountId: ID!, $orderStatus: [String]) {
  ordersByAccountId(accountId: $accountId, orderStatus: $orderStatus) {
    totalCount
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
    nodes {
      _id
      account {
        _id
      }
      cartId
      createdAt
      displayStatus(language: "en")
      email
      fulfillmentGroups {
        status
      }
      notes {
        content
      }
      referenceId
      shop {
        _id
      }
      status
      summary {
        total {
          amount
        }
      }
      totalItemQuantity
      updatedAt
    }
  }
}`;

const order = Factory.Order.makeOne({
  _id: orderId,
  shopId,
  workflow: {
    status: "new"
  },
  accountId: mockAccount._id
});

const orders = Factory.Order.makeMany(10, {
  _id: (iterator) => (iterator + 500).toString(),
  referenceId: (iterator) => (iterator + 123).toString(),
  shopId,
  workflow: {
    status: "new"
  },
  accountId: mockAccount._id
});

let testApp;
let query;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(ordersByAccountIdQuery);
  await testApp.createUserAndAccount(mockAccount);
  await testApp.insertPrimaryShop({ _id: shopId, name: "Shop Name" });
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
  await testApp.collections.Orders.deleteMany({});
});

afterAll(() => testApp.stop());

test("get 1 order by account ID, without shopID or order status", async () => {
  await testApp.collections.Orders.insertOne(order);
  await testApp.setLoggedInUser(mockAccount);
  const result = await query({ accountId: opaqueAccountId });
  expect(result).toBeTruthy();
  expect(result.ordersByAccountId.nodes[0].account._id).toBe(opaqueAccountId);
});

test("get multiple orders by account ID, without shopID or order status", async () => {
  await Promise.all(orders.map((mockOrder) => testApp.collections.Orders.insertOne(mockOrder)));
  await testApp.setLoggedInUser(mockAccount);
  const result = await query({ accountId: opaqueAccountId });
  expect(result).toBeTruthy();
  expect(result.ordersByAccountId.totalCount).toBe(10);
});
