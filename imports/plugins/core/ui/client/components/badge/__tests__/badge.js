/**
 * Mock Translation component import, as it uses Meteor modules we have a hard time testing with Jest
 */
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
 * Badge is a display only component
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
      badgeSize="Size of Badge"
      className="Classes to apply to badge"
      i18nKeyLabel="path.to.i18n.key"
      label="Text to display"
      status="Badge status"
    />
  );
  const tree = shallowToJSON(component);
  expect(tree).toMatchSnapshot();
});
