jest.mock("/imports/plugins/core/ui/client/components", () => {
  return {
    Translation(props) {
      return <span>{props.defaultValue}</span>; // eslint-disable-line
    }
  };
});

import React from "react";
import Badge from "../badge";
import { shallow } from "enzyme";
import shallowToJSON from "enzyme-to-json";

/**
 * Order Summary is a display only component
 * It receives props and displays them accordingly
 */

afterEach(() => {
  jest.clearAllMocks();
});

/**
 * Snapshots make sure your UI does not change unexpectedly
 */

test("Badge snapshot test", () => {
  const component = shallow(
    <Badge
      label="Badge Label"
    />
  );
  const tree = shallowToJSON(component);
  expect(tree).toMatchSnapshot();
});
