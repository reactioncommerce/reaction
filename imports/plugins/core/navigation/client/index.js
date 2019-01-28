
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { registerOperatorRoute } from "/imports/client/ui";

import "./containers";
import "./templates";
import "./styles.less";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  mainComponent: "navigationDashboard",
  path: "/navigation",
  // eslint-disable-next-line react/display-name
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faLink} {...props} />,
  sidebarI18nLabel: "admin.navigation.navigation"
});
