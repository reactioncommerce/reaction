import LocalShipping from "@material-ui/icons/LocalShipping";
import { registerOperatorRoute } from "/imports/client/ui";
import Shipping from "./components/Shipping";
import "./components";
import "./containers";
import "./templates";

registerOperatorRoute({
  path: "/shipping",
  mainComponent: Shipping,
  sidebarIconComponent: LocalShipping,
  sidebarI18nLabel: "admin.dashboard.shippingLabel"
});
