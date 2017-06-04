import React from "react";
import OrderSummary from "../../components/orderSummary";
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

test("OrderSummary snapshot test", () => {
  // Initializing all the props passed into order summary component
  const dateFormat = jest.fn();
  const tracking = jest.fn();
  const shipmentStatus = jest.fn(()=>({}));
  const printableLabels = jest.fn(()=>({}));
  const profileShippingAddress = {};
  const order = {
    shipping: [{ shipmentMethod: {} }],
    billing: [
      { paymentMethod: {},
        invoice: {}
      }
    ]
  };

  const component = shallow(
    <OrderSummary
      dateFormat={dateFormat}
      tracking={tracking}
      profileShippingAddress={profileShippingAddress}
      shipmentStatus={shipmentStatus}
      printableLabels={printableLabels}
      order={order}
    />
  );
  const tree = shallowToJSON(component);
  expect(tree).toMatchSnapshot();
});
