import React from "react";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import { MockedProvider } from "@apollo/react-testing";
import waitForFalseyProp from "/imports/test-utils/helpers/waitForFalseyProp";
import getPrimaryShopId from "../queries/getPrimaryShopId";
import withPrimaryShopId from "./withPrimaryShopId";

const fakeOpaqueShopId = "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==";
const MockComponent = () => <div>Mock</div>;
const TestComponent = withPrimaryShopId(MockComponent);

test("renders child component with correct shop id", async () => {
  const mocks = [{
    request: { query: getPrimaryShopId },
    result: {
      data: {
        primaryShopId: fakeOpaqueShopId
      }
    }
  }];

  let wrapper;
  act(() => {
    wrapper = mount(<MockedProvider mocks={mocks}>
      <TestComponent />
    </MockedProvider>);
  });

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingPrimaryShopId");

  expect(wrapper.find("MockComponent").prop("shopId")).toBe(fakeOpaqueShopId);
});
