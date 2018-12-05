import React, { Component } from "react";
import { registerComponent } from "@reactioncommerce/reaction-components";


class NavigationDashboardContainer extends Component {
  render() {
    return <p>Hello World</p>;
  }
}


registerComponent("NavigationDashboard", NavigationDashboardContainer);

export default NavigationDashboardContainer;
