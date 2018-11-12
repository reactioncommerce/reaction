import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";

import { registerOperatorRoute } from "/imports/client/ui";

import "./checkout";
import "./settings";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  mainComponent: "paymentSettings",
  path: "/payment",
  // eslint-disable-next-line react/display-name
  sidebarIconComponent: <FontAwesomeIcon icon={faCreditCard} />,
  sidebarI18nLabel: "admin.settings.paymentSettingsLabel"
});
