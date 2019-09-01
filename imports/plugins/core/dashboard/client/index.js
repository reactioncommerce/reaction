import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";

import { registerBlock } from "/imports/plugins/core/components/lib";
import { registerOperatorRoute } from "/imports/client/ui";
import OperatorLanding from "/imports/plugins/core/dashboard/client/components/OperatorLanding";

import PluginVersions from "./components/PluginVersions";
import ShopLogoUrls from "./components/ShopLogoUrls";
import StorefrontUrls from "./components/StorefrontUrls";

import "./components/shopBrandImageOption";
import "./components/ShopBrandMediaManager";

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

registerBlock({
  region: "ShopSettings",
  name: "PluginVersions",
  component: PluginVersions,
  priority: 1
});

registerBlock({
  region: "ShopSettings",
  name: "ShopLogoUrls",
  component: ShopLogoUrls,
  priority: 2
});

registerBlock({
  region: "ShopSettings",
  name: "StorefrontUrls",
  component: StorefrontUrls,
  priority: 3
});
