
import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.navigationDashboard.helpers({
  NavigationDashboard() {
    return Components.NavigationDashboard;
  }
});
