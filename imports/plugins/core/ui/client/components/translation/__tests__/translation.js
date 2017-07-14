import React from "react";
import Translation from "../translation";
import { shallow } from "enzyme";
import shallowToJSON from "enzyme-to-json";


jest.mock("/client/api", () => {
  return {
    i18next: {
      t: (key, { defaultValue }) => {
        return defaultValue || key;
      }
    }
  };
});


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

test("Translation snapshot test", () => {
  const component = shallow(
    <Translation
      defaultValue="Translated Text"
      i18nKey={"path.to.key"}
    />
  );
  const tree = shallowToJSON(component);
  expect(tree).toMatchSnapshot();
});
