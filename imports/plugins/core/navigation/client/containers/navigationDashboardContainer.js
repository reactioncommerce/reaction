import { compose } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import NavigationDashboard from "../components/NavigationDashboard";
import withCreateNavigationItem from "../hocs/withCreateNavigationItem";
import withUpdateNavigationItem from "../hocs/withUpdateNavigationItem";
import withUpdateNavigationTree from "../hocs/withUpdateNavigationTree";
import withDefaultNavigationTree from "../hocs/withDefaultNavigationTree";
import withNavigationItems from "../hocs/withNavigationItems";
import withDefaultNavigationTreeId from "../hocs/withDefaultNavigationTreeId";
import withNavigationUIStore from "../hocs/withNavigationUIStore";
import withNavigationShopSettings from "../hocs/withNavigationShopSettings";

registerComponent("NavigationDashboard", NavigationDashboard, [
  withNavigationShopSettings,
  withNavigationUIStore,
  withCreateNavigationItem,
  withDefaultNavigationTreeId,
  withDefaultNavigationTree,
  withNavigationItems,
  withUpdateNavigationItem,
  withUpdateNavigationTree
]);

export default compose(
  withNavigationShopSettings,
  withNavigationUIStore,
  withCreateNavigationItem,
  withDefaultNavigationTreeId,
  withDefaultNavigationTree,
  withNavigationItems,
  withUpdateNavigationItem,
  withUpdateNavigationTree
)(NavigationDashboard);
