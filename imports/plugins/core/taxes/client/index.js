import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversity } from "@fortawesome/free-solid-svg-icons";
import { registerOperatorRoute } from "/imports/client/ui";

import "./settings/custom.html";
import "./settings/custom.js";
import "./settings/settings.html";
import "./settings/settings.js";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  mainComponent: "taxSettings",
  path: "/tax-settings",
  // eslint-disable-next-line react/display-name
  sidebarIconComponent: () => <FontAwesomeIcon icon={faUniversity} size="lg"/>,
  sidebarI18nLabel: "admin.dashboard.taxesLabel"
});
