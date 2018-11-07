import Email from "@material-ui/icons/Email";

import { registerOperatorRoute } from "/imports/client/ui";
import EmailConfigContainer from "./containers/EmailConfigContainer";
import "./templates/email.html";
import "./templates/email.js";

export { default as EmailTableColumn } from "./components/emailTableColumn";
export { default as EmailLogs } from "./containers/emailLogs";

registerOperatorRoute({
  path: "/email",
  mainComponent: EmailConfigContainer,
  sidebarIconComponent: Email,
  sidebarI18nLabel: "admin.dashboard.emailLabel"
});
