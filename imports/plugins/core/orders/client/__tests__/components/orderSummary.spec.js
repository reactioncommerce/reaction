// test("Bla", () => {
//   expect(true).toBe(true);
// });
import React from "react";
import OrderSummary from "../../components/orderSummary";
import { shallow } from "enzyme";
import shallowToJSON from "enzyme-to-json";

test("OrderSummary snapshot test", () => {
  const component = shallow(<OrderSummary dateFormat={()=>{}}
                                          tracking={()=>{}}
                                          order={{ shipping: [{ shipmentMethod: {} }], billing: [{ paymentMethod: {}, invoice: {} }] }}
                                          shipmentStatus={()=>({})}
                                          profile={{}}
                                          printableLabels={()=>({})} />);
  const tree = shallowToJSON(component);
  expect(tree).toMatchSnapshot();
});
