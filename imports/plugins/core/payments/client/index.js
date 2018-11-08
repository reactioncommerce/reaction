import { registerOperatorRoute } from "/imports/client/ui";
import Payment from "@material-ui/icons/Payment";

import "./checkout";
import "./settings";

registerOperatorRoute({
  isNavigationLink: true,
  mainComponent: "paymentSettings",
  path: "/payment",
  sidebarIconComponent: Payment,
  sidebarI18nLabel: "admin.settings.paymentSettingsLabel"
});
