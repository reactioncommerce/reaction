import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";

import { registerOperatorRoute } from "/imports/client/ui";
import OperatorLanding from "/imports/plugins/core/dashboard/client/components/OperatorLanding";

import "./templates/import/import.html";
import "./templates/import/import.js";

import "./templates/packages/grid/grid.html";
import "./templates/packages/grid/grid.js";
import "./templates/packages/grid/package.html";
import "./templates/packages/grid/package.js";
import "./templates/packages/packages.html";
import "./templates/packages/packages.js";

import "./templates/settings/settings.html";
import "./templates/settings/settings.js";

import "./templates/shop/settings/settings.html";
import "./templates/shop/settings/settings.less";
import "./templates/shop/settings/settings.js";

import "./templates/dashboard.html";
import "./templates/dashboard.js";

// Default landing page
registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/",
  mainComponent: OperatorLanding
});

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  priority: 10,
  path: "/shop-settings",
  mainComponent: "shopSettings",
  // eslint-disable-next-line react/display-name
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faStore} {...props} />,
  sidebarI18nLabel: "admin.settings.shopSettingsLabel"
});
