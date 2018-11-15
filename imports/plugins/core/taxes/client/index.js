import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversity } from "@fortawesome/free-solid-svg-icons";
import { registerOperatorRoute } from "/imports/client/ui";

import "../lib/extendCoreSchemas";
import "./settings/settings.html";
import "./settings/settings.js";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  mainComponent: "taxSettings",
  path: "/tax-settings",
  // eslint-disable-next-line react/display-name
  sidebarIconComponent: <FontAwesomeIcon icon={faUniversity} />,
  sidebarI18nLabel: "admin.dashboard.taxesLabel"
});
