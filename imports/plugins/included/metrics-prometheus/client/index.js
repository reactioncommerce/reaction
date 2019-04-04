import React from "react";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MetricsSettings } from "../components";
import { registerOperatorRoute } from "/imports/client/ui";
import info from "../info";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  path: "/metrics/prometheus",
  mainComponent: MetricsSettings,
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => (
    <FontAwesomeIcon icon={faChartLine} {...props} />
  ),
  sidebarI18nLabel: `${info.ns}.displayName`
});
