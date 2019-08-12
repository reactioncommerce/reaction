import React from "react";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import { MockedProvider } from "@apollo/react-testing";
import waitForFalseyProp from "/imports/test-utils/helpers/waitForFalseyProp";
import getShopId from "../queries/getShopId";
import withShopId from "./withShopId";

const fakeOpaqueShopId = "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==";
const MockComponent = () => <div>Mock</div>;
const TestComponent = withShopId(MockComponent);
const mocks = [
  {
    request: {
      query: getShopId,
      variables: {
        slug: "reaction"
      }
    },
    result: {
      data: {
        shopBySlug: {
          _id: fakeOpaqueShopId
        }
      }
    }
  },
  {
    request: {
      query: getShopId,
      variables: {
        slug: "fakeSlug"
      }
    },
    result: {
      data: {
        shopBySlug: null
      }
    }
  }
];

test("renders child component with correct shop id", async () => {
  let wrapper;
  act(() => {
    wrapper = mount((
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestComponent shopSlug="reaction" />
      </MockedProvider>
    ));
  });

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingShopId");

  expect(wrapper.find("MockComponent").prop("shopId")).toBe(fakeOpaqueShopId);
});

test("doesn't query GraphQL if no shopSlug is provided", () => {
  let wrapper;
  act(() => {
    wrapper = mount((
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestComponent />
      </MockedProvider>
    ));
  });

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("shopId")).toBe(undefined);
  expect(mockComponentInstance.prop("isLoadingShopId")).toBe(undefined);
});

test("passes shouldSkipGraphql to child component if invalid shopSlug is provided", async () => {
  let wrapper;
  act(() => {
    wrapper = mount((
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestComponent shopSlug="fakeSlug" />
      </MockedProvider>
    ));
  });

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingShopId");

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("shopId")).toBe(undefined);
  expect(mockComponentInstance.prop("shouldSkipGraphql")).toBe(true);
});
