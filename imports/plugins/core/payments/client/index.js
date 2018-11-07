import { registerOperatorRoute } from "/imports/client/ui";
import Payment from "@material-ui/icons/Payment";

import "./checkout";
import "./settings";

registerOperatorRoute({
  path: "/payment",
  mainComponent: "paymentSettings",
  sidebarIconComponent: Payment,
  sidebarI18nLabel: "admin.dashboard.paymentsLabel"
});
