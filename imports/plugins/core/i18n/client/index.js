import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import { registerOperatorRoute } from "/imports/client/ui";
import Localization from "./containers/localizationSettings";

export { default as LocalizationSettings } from "./containers/localizationSettings";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  mainComponent: Localization,
  path: "/localization",
  // eslint-disable-next-line react/display-name
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faGlobe} {...props} />,
  sidebarI18nLabel: "admin.i18nSettings.shopLocalization"
});
