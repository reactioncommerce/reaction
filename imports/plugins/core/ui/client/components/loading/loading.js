import React from "react";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const Loading = () => (
  <div className="spinner-container spinner-container-lg">
    <Components.CircularProgress indeterminate={true} />
  </div>
);

registerComponent("Loading", Loading);

export default Loading;
