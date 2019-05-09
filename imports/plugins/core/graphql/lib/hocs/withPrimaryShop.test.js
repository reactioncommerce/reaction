import React from "react";
import { mount } from "enzyme";
import { MockedProvider } from "react-apollo/test-utils";
import waitForFalseyProp from "/imports/test-utils/helpers/waitForFalseyProp";
import getPrimaryShop from "../queries/getPrimaryShop";
import withPrimaryShop from "./withPrimaryShop";

const fakeShop = {
  _id: "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==",
  name: "Shop name",
  storefrontUrls: {
    storefrontHomeUrl: "storefrontHomeUrl",
    storefrontOrderUrl: "storefrontOrderUrl",
    storefrontOrdersUrl: "storefrontOrdersUrl",
    storefrontAccountProfileUrl: "storefrontAccountProfileUrl"
  }
};

const MockComponent = () => <div>Mock</div>;
const TestComponent = withPrimaryShop(MockComponent);

test("renders child component with correct shop prop", async () => {
  const mocks = [{
    request: { query: getPrimaryShop },
    result: {
      data: {
        fakeShop
      }
    }
  }];

  const wrapper = mount((
    <MockedProvider mocks={mocks}>
      <TestComponent />
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingPrimaryShop");

  expect(wrapper.find("MockComponent").prop("shop")).toBe(fakeShop);
});
