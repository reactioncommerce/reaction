
import React from "react";
import LinkIcon from "mdi-material-ui/LinkVariant";
import { registerOperatorRoute } from "/imports/client/ui";
import NavigationDashboard from "./containers/navigationDashboardContainer";

import "./containers";
import "./templates";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: false,
  priority: 40,
  layoutComponent: null,
  mainComponent: NavigationDashboard,
  path: "/navigation",
  // eslint-disable-next-line react/display-name
  SidebarIconComponent: (props) => <LinkIcon {...props} />,
  sidebarI18nLabel: "admin.navigation.navigation"
});
