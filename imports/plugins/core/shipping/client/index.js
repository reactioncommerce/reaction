import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShippingFast } from "@fortawesome/free-solid-svg-icons";

import { registerOperatorRoute } from "/imports/client/ui";
import Shipping from "./components/Shipping";
import "./components";
import "./containers";
import "./templates";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  mainComponent: Shipping,
  path: "/shipping",
  // eslint-disable-next-line react/display-name
  sidebarIconComponent: <FontAwesomeIcon icon={faShippingFast} />,
  sidebarI18nLabel: "admin.dashboard.shippingLabel"
});
