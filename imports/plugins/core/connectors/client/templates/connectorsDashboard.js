import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.connectorsDashboard.helpers({
  ConnectorsDashboard() {
    return Components.ConnectorsDashboard;
  }
});
