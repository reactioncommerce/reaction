import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

import { registerOperatorRoute } from "/imports/client/ui";
import EmailConfigContainer from "./containers/EmailConfigContainer";
import "./templates/email.html";
import "./templates/email.js";

export { default as EmailTableColumn } from "./components/emailTableColumn";
export { default as EmailLogs } from "./containers/emailLogs";

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  path: "/email",
  mainComponent: EmailConfigContainer,
  // eslint-disable-next-line react/display-name
  sidebarIconComponent: <FontAwesomeIcon icon={faEnvelope} />,
  sidebarI18nLabel: "admin.dashboard.emailLabel"
});
