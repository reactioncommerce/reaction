import React from "react";
import { mount } from "enzyme";
import { MockedProvider } from "react-apollo/test-utils";
import waitForTruthyProp from "/imports/test-utils/helpers/waitForTruthyProp";
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

  const wrapper = mount((
    <MockedProvider mocks={mocks}>
      <TestComponent />
    </MockedProvider>
  ));

  await waitForTruthyProp(wrapper, "MockComponent", "isLoadingPrimaryShopId");

  expect(wrapper.find("MockComponent").prop("shopId")).toBe(fakeOpaqueShopId);
});
