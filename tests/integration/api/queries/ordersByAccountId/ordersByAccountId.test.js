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
        _id
        displayStatus(language: "en")
        status
        tracking
        trackingUrl
        type
      }
      notes {
        content
      }
      payments {
        _id
        amount {
          amount
          displayAmount
        }
        billingAddress {
          _id
          address1
          address2
        }
        cardBrand
        displayName
        isCaptured
        method {
          displayName
          isEnabled
          name
          pluginName
        }
        mode
        processor
        riskLevel
        status
        transactionId
      }
      referenceId
      refunds {
        _id
      }
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
      surcharges {
        _id
        fulfillmentGroupId
      }
    }
  }
}`;

const order = Factory.Order.makeOne({
  _id: orderId,
  accountId: mockAccount._id,
  payments: {
    _id: "Dez6yxGsD5sMYvaCi",
    data: {
      fullName: "Reaction Commerce",
      gqlType: "ExampleIOUPaymentData"
    },
    displayName: "IOU from Reaction Commerce",
    method: "credit",
    mode: "authorize",
    name: "iou_example",
    paymentPluginName: "example-paymentmethod",
    processor: "Example",
    riskLevel: "normal",
    shopId,
    status: "created",
    transactionId: "s9atGoLbagKvQ3pJc"
  },
  shopId,
  workflow: {
    status: "new"
  }
});

const orders = Factory.Order.makeMany(10, {
  _id: (iterator) => (iterator + 500).toString(),
  accountId: mockAccount._id,
  referenceId: (iterator) => (iterator + 123).toString(),
  shopId,
  payments: {
    _id: (iterator) => (iterator + 33).toString(),
    data: {
      fullName: "Reaction Commerce",
      gqlType: "ExampleIOUPaymentData"
    },
    displayName: "IOU from Reaction Commerce",
    method: "credit",
    mode: "authorize",
    name: "iou_example",
    paymentPluginName: "example-paymentmethod",
    processor: "Example",
    riskLevel: "normal",
    shopId,
    status: "created",
    transactionId: "s9atGoLbagKvQ3pJc"
  },
  workflow: {
    status: "new"
  }
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
