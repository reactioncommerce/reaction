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
import ClickToCopy from "../clickToCopy";
import { shallow } from "enzyme";
import shallowToJSON from "enzyme-to-json";

/**
 * ClickToCopy is a display element that will copy text to your clipboard when clicked
 * It recieves props, and acts accordingly
 */

afterEach(() => {
  jest.clearAllMocks();
});

/**
 * Snapshots make sure your UI does not change unexpectedly
 */

test("ClickToCopy snapshot test", () => {
  const component = shallow(
    <ClickToCopy
      copyToClipboard="Text to copy to clipboard"
      displayText="Text to display"
      i18nKeyTooltip="path.to.i18n.key"
      tooltip="Tooltip text"
    />
  );
  const tree = shallowToJSON(component);
  expect(tree).toMatchSnapshot();
});
