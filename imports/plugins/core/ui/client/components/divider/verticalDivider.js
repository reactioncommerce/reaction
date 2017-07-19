import React from "react";
import { pure } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";

const VerticalDivider = () => (
  <div
    style={{
      height: "20px",
      width: 1,
      backgroundColor: "#E6E6E6",
      margin: "0 10px"
    }}
  />
);

registerComponent("VerticalDivider", VerticalDivider, pure);

export default VerticalDivider;
