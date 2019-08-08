import React from "react";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import { MockedProvider } from "@apollo/react-testing";
import waitForFalseyProp from "/imports/test-utils/helpers/waitForFalseyProp";
import getTagId from "../queries/getTagId";
import withTagId from "./withTagId";

const fakeOpaqueTagId = "cmVhY3Rpb24vdGFnOnJwakN2VEJHamhCaTJ4ZHJv";
const MockComponent = () => <div>Mock</div>;
const TestComponent = withTagId(MockComponent);
const mocks = [
  {
    request: {
      query: getTagId,
      variables: {
        slugOrId: "shop"
      }
    },
    result: {
      data: {
        tag: {
          _id: fakeOpaqueTagId
        }
      }
    }
  },
  {
    request: {
      query: getTagId,
      variables: {
        slugOrId: "fakeSlug"
      }
    },
    result: {
      data: {
        tag: null
      }
    }
  }
];


test("renders child component with correct tag id", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent tagSlugOrId="shop" />
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingTagId");

  expect(wrapper.find("MockComponent").prop("tagId")).toBe(fakeOpaqueTagId);
});

test("doesn't query GraphQL if no tagSlug is provided", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent />
    </MockedProvider>
  ));

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("tagId")).toBe(undefined);
  expect(mockComponentInstance.prop("isLoadingTagId")).toBe(undefined);
});

test("passes shouldSkipGraphql to child component if invalid tagSlug is provided", async () => {
  let wrapper;
  act(() => {
    wrapper = mount((
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestComponent tagSlugOrId="fakeSlug" />
      </MockedProvider>
    ));
  });

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingTagId");

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("tagId")).toBe(undefined);
  expect(mockComponentInstance.prop("shouldSkipGraphql")).toBe(true);
});
