import { Template } from "meteor/templating";
import { NotificationRouteContainer } from "../containers";

Template.notificationRoute.helpers({
  notificationRoute() {
    return {
      component: NotificationRouteContainer
    };
  }
});
