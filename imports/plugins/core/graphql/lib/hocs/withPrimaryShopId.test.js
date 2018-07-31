import React, { Component } from "react";
import { compose } from "recompose";
import { mount } from "enzyme";
import { MockedProvider } from "react-apollo/test-utils";
import getPrimaryShopId from "../queries/getPrimaryShopId";
import withPrimaryShopId from "./withPrimaryShopId";

const fakeOpaqueShopId = "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==";
const MockComponent = () => <div>Mock</div>;
const TestComponent = compose(withPrimaryShopId)(MockComponent);

test("renders child component with correct shop id", async () => {
  const mocks = [{
    request: { query: getPrimaryShopId },
    result: {
      data: {
        primaryShopId: fakeOpaqueShopId
      }
    }
  }];

  const wrapper = mount(
    <MockedProvider mocks={mocks}>
      <TestComponent />
    </MockedProvider>
  );

  // Wait for next tick to get past loading state
  await new Promise(resolve => setTimeout(resolve));

  expect(wrapper.update().find("MockComponent").prop("shopId")).toBe(fakeOpaqueShopId);
});
