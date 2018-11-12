import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faColumns } from "@fortawesome/free-solid-svg-icons";

import { registerOperatorRoute } from "/imports/client/ui";
import "./templates/settings.html";
import "./templates/settings.js";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  path: "/templates",
  mainComponent: "templateSettings",
  // eslint-disable-next-line react/display-name
  sidebarIconComponent: <FontAwesomeIcon icon={faColumns} />,
  sidebarI18nLabel: "admin.settings.templateSettingsLabel"
});
