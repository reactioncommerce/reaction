import React from "react";
import { mount } from "enzyme";
import { MockedProvider } from "react-apollo/test-utils";
import waitForFalseyProp from "/imports/test-utils/helpers/waitForFalseyProp";
import getTags from "../queries/getTags";
import withTags from "./withTags";

const fakeOpaqueTagId = "cmVhY3Rpb24vdGFnOnJwakN2VEJHamhCaTJ4ZHJv";
const fakeOpaqueShopId = "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==";
const MockComponent = () => <div>Mock</div>;
const TestComponent = withTags(MockComponent);
const mocks = [
  {
    request: {
      query: getTags,
      variables: {
        shopId: fakeOpaqueShopId,
        isTopLevel: true
      }
    },
    result: {
      data: {
        tags: {
          nodes: [{
            _id: "cmVhY3Rpb24vdGFnOnJwakN2VEJHamhCaTJ4ZHJv",
            name: "Shop",
            subTagIds: [],
            slug: "shop",
            heroMediaUrl: null
          }]
        }
      }
    }
  },
  {
    request: {
      query: getTags,
      variables: {
      }
    },
    result: {
      data: {
        tags: null
      }
    }
  }
];


test("renders child component with correct tags", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent shopId={fakeOpaqueShopId} isTopLevel/>
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoading");

  expect(wrapper.find("MockComponent").prop("tags[0]._id")).toBe(fakeOpaqueTagId);
});

test("doesn't query GraphQL if no shopId is provided", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent />
    </MockedProvider>
  ));

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("tags")).toBe(undefined);
  expect(mockComponentInstance.prop("isLoading")).toBe(undefined);
});

test("passes shouldSkipGraphql to child component if invalid shopId is provided", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent shopId="fakeShopId" />
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoading");

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("tags")).toBe(undefined);
  expect(mockComponentInstance.prop("shouldSkipGraphql")).toBe(true);
});
