import React from "react";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import { MockedProvider } from "@apollo/react-testing";
import waitForFalseyProp from "/imports/test-utils/helpers/waitForFalseyProp";
import getCatalogItems from "../queries/getCatalogItems";
import withCatalogItems from "./withCatalogItems";

const fakeOpaqueShopId = "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==";
const fakeOpaqueTagId = "cmVhY3Rpb24vdGFnOnJwakN2VEJHamhCaTJ4ZHJv";
const fakeCatalogItemsConnection = {
  __typename: "CatalogItemConnection",
  totalCount: 1,
  pageInfo: {
    endCursor: "N3l4bmdxZm13TUFrQVR5SzU=",
    startCursor: "N3l4bmdxZm13TUFrQVR5SzU=",
    hasNextPage: false,
    hasPreviousPage: false,
    __typename: "PageInfo"
  },
  edges: [
    {
      __typename: "CatalogItemEdge",
      cursor: "N3l4bmdxZm13TUFrQVR5SzU=",
      node: {
        __typename: "CatalogItemProduct",
        _id: "cmVhY3Rpb24vY2F0YWxvZ0l0ZW06N3l4bmdxZm13TUFrQVR5SzU=",
        product: {
          __typename: "CatalogProduct",
          _id: "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6QkNUTVo2SFR4RlNwcEpFU2s=",
          title: "Basic Reaction Producdts",
          slug: "basic-reaction-product",
          description: "Sign in as administrator to edit.",
          vendor: "Example Manufacturer",
          isLowQuantity: false,
          isSoldOut: false,
          isBackorder: false,
          shop: {
            __typename: "Shop",
            currency: {
              __typename: "Currency",
              code: "USD"
            }
          },
          pricing: [
            {
              __typename: "ProductPricingInfo",
              currency: {
                __typename: "Currency",
                code: "USD"
              },
              displayPrice: "$12.99 - $19.99",
              minPrice: 12.99,
              maxPrice: 19.99,
              currencyExchangePricing: {
                __typename: "ProductPricingInfo",
                currency: {
                  __typename: "Currency",
                  code: "USD"
                },
                displayPrice: "$12.99 - $19.99",
                minPrice: 12.99,
                maxPrice: 19.99
              }
            }
          ],
          primaryImage: null
        }
      }
    }
  ]
};

const MockComponent = () => <div>Mock</div>;
const TestComponent = withCatalogItems(MockComponent);
const mocks = [
  {
    request: {
      query: getCatalogItems,
      variables: {
        shopId: fakeOpaqueShopId,
        currencyCode: "USD",
        tagIds: [fakeOpaqueTagId]
      }
    },
    result: {
      data: {
        catalogItems: fakeCatalogItemsConnection
      }
    }
  },
  {
    request: {
      query: getCatalogItems,
      variables: {
        shopId: "invalidShopId",
        currencyCode: "USD"
      }
    },
    result: {
      data: {
        catalogItems: null
      }
    }
  }
];

test("renders child component with correct catalogItems connection", async () => {
  let wrapper;
  act(() => {
    wrapper = mount((
      <MockedProvider mocks={mocks}>
        <TestComponent shopId={fakeOpaqueShopId} tagId={fakeOpaqueTagId} />
      </MockedProvider>
    ));
  });

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingCatalogItems");

  const catalogItems = wrapper.find("MockComponent").prop("catalogItems");
  expect(Array.isArray(catalogItems)).toBe(true);
  expect(catalogItems.length).toBe(1);
  expect(catalogItems[0]._id).toBe(fakeCatalogItemsConnection.edges[0].node.product._id);
});

test("doesn't query GraphQL if no shopId is provided", async () => {
  let wrapper;
  act(() => {
    wrapper = mount((
      <MockedProvider mocks={mocks}>
        <TestComponent />
      </MockedProvider>
    ));
  });

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("catalogItems")).toBe(undefined);
  expect(mockComponentInstance.prop("isLoadingCatalogItems")).toBe(undefined);
});

test("returns an empty array for catalogItems if invalid shopId is provided", async () => {
  let wrapper;
  act(() => {
    wrapper = mount((
      <MockedProvider mocks={mocks}>
        <TestComponent shopId="invalidShopId" />
      </MockedProvider>
    ));
  });

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingCatalogItems");

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("catalogItems")).toEqual([]);
});
