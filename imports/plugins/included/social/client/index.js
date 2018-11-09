import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareAltSquare } from "@fortawesome/free-solid-svg-icons";

import { registerOperatorRoute } from "/imports/client/ui";
import SocialSettings from "./containers/socialSettingsContainer";
import "./templates/apps/facebook.html";
import "./templates/apps/facebook.js";
import "./templates/apps/googleplus.html";
import "./templates/apps/googleplus.js";
import "./templates/apps/pinterest.html";
import "./templates/apps/pinterest.js";
import "./templates/apps/twitter.html";
import "./templates/apps/twitter.js";

import "./templates/dashboard/social.html";
import "./templates/dashboard/social.js";

import "./templates/social.html";
import "./templates/social.js";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  mainComponent: SocialSettings,
  path: "/social-settings",
  // eslint-disable-next-line react/display-name
  sidebarIconComponent: () => <FontAwesomeIcon icon={faShareAltSquare} size="lg" />,
  sidebarI18nLabel: "admin.dashboard.socialLabel"
});
