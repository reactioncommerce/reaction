import styledMUI from "styled-components-mui";
import { applyTheme } from "@reactioncommerce/components/utils";
import LocalShipping from "@material-ui/icons/LocalShipping";
import { registerOperatorRoute } from "/imports/client/ui";
import Shipping from "./components/Shipping";
import "./components";
import "./containers";
import "./templates";

const ShippingIcon = styledMUI(LocalShipping)`
  color: ${applyTheme("Sidebar.iconColor")};
`;

registerOperatorRoute({
  path: "/shipping",
  mainComponent: Shipping,
  sidebarIconComponent: ShippingIcon,
  sidebarI18nLabel: "admin.dashboard.shippingLabel"
});
