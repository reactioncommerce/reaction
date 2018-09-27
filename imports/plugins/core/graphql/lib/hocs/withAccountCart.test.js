import React from "react";
import { mount } from "enzyme";
import { MockedProvider } from "react-apollo/test-utils";
import waitForFalseyProp from "/imports/test-utils/helpers/waitForFalseyProp";
import getAccountCart from "../queries/getAccountCart";
import withAccountCart from "./withAccountCart";

const fakeOpaqueAccountId = "cmVhY3Rpb24vYWNjb3VudDpYeFhkWEF0MnZGbzhFd2JKMw==";
const fakeOpaqueShopId = "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==";
const fakeOpaqueCartId = "cmVhY3Rpb24vY2FydDpoM0xNY0tONEJ3TDNjR3hRSg==";
const MockComponent = () => <div>Mock</div>;
const TestComponent = withAccountCart(MockComponent);

const cartItem = {
  _id: "cmVhY3Rpb24vY2FydEl0ZW06SzdNem15WUJnQnBGajVmUFI=",
  productConfiguration: {
    productId: "cmVhY3Rpb24vcHJvZHVjdDpCQ1RNWjZIVHhGU3BwSkVTaw==",
    productVariantId: "cmVhY3Rpb24vcHJvZHVjdDpTTXI0cmhERm5ZdkZNdERUWA=="
  },
  addedAt: "2018-09-12T09:57:32.955Z",
  attributes: [
    {
      label: null,
      value: "Basic Example Variant"
    },
    {
      label: null,
      value: "Option 1 - Red Dwarf"
    }
  ],
  createdAt: "2018-09-12T09:57:32.955Z",
  isBackorder: false,
  isLowQuantity: false,
  isSoldOut: false,
  imageURLs: null,
  metafields: null,
  parcel: {
    length: 10,
    width: 10,
    weight: 25,
    height: 3
  },
  price: {
    amount: 19.99,
    displayAmount: "$19.99",
    currency: {
      code: "USD"
    }
  },
  priceWhenAdded: {
    amount: 19.99,
    displayAmount: "$19.99",
    currency: {
      code: "USD"
    }
  },
  productSlug: "basic-reaction-product",
  productType: "product-simple",
  quantity: 1,
  shop: {
    _id: "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg=="
  },
  title: "Basic Reaction Product",
  variantTitle: "Option 1 - Red Dwarf",
  optionTitle: "Red",
  updatedAt: "2018-09-12T09:57:32.955Z",
  currentQuantity: 19
};

const mocks = [
  {
    request: {
      query: getAccountCart,
      variables: {
        accountId: fakeOpaqueAccountId,
        shopId: fakeOpaqueShopId
      }
    },
    result: {
      data: {
        cart: {
          _id: fakeOpaqueCartId,
          createdAt: "2018-09-12T09:57:32.963Z",
          shop: {
            _id: "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg=="
          },
          updatedAt: "2018-09-12T09:57:32.993Z",
          expiresAt: null,
          totalItemQuantity: 1,
          checkout: {
            summary: {
              discountTotal: {
                amount: 0
              },
              fulfillmentTotal: null,
              itemTotal: {
                amount: 19.99
              },
              taxTotal: null,
              total: {
                amount: 19.99
              }
            }
          },
          items: {
            pageInfo: {
              hasNextPage: false,
              endCursor: "WVhKeVlYbGpiMjV1WldOMGFXOXVPakE9"
            },
            edges: [
              {
                node: cartItem
              }
            ]
          },
          account: {
            _id: "cmVhY3Rpb24vYWNjb3VudDpYeFhkWEF0MnZGbzhFd2JKMw=="
          }
        }
      }
    }
  },
  {
    request: {
      query: getAccountCart,
      variables: {
        accountId: "fakeAccountId",
        shopId: "fakeShopId"
      }
    },
    result: {
      data: {
        cart: null
      }
    }
  }
];

test.only("renders child component with correct cartId", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent shopId={fakeOpaqueShopId} viewerId={fakeOpaqueAccountId}/>
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingAccountCart");

  expect(wrapper.find("MockComponent").prop("cartId")).toBe(fakeOpaqueCartId);
});

test("renders child component with correct cart items", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent shopId={fakeOpaqueShopId} accountId={fakeOpaqueAccountId}/>
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingAccountCart");

  expect(wrapper.find("MockComponent").prop("cartItems")[0]).toBe(cartItem);
});

test("doesn't query GraphQL if no shopId is provided", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent />
    </MockedProvider>
  ));

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("cart")).toBe(undefined);
  expect(mockComponentInstance.prop("isLoadingAccountCart")).toBe(undefined);
});

test("passes shouldSkipGraphql to child component if invalid shopId or accountId is provided", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent shopId="fakeShopId" accountId="fakeAccountId"/>
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoading");

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("tags")).toBe(undefined);
  expect(mockComponentInstance.prop("shouldSkipGraphql")).toBe(true);
});
