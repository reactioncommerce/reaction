import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import { registerOperatorRoute } from "/imports/client/ui";

import "./settings/search.html";
import "./settings/search.js";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  mainComponent: "searchSettings",
  path: "/search",
  // eslint-disable-next-line react/display-name
  sidebarIconComponent: () => <FontAwesomeIcon icon={faSearch} size="lg" />,
  sidebarI18nLabel: "admin.dashboard.searchLabel"
});
