import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Notifications } from "/lib/collections";
import { Notification } from "../components";

function composer(props, onData) {
  if (Meteor.subscribe("Notification", Meteor.userId()).ready()) {
    const notificationList = Notifications.find({}, { sort: { timeSent: -1 }, limit: 5 }).fetch();
    const unread = Notifications.find({ status: "unread" }).count();

    onData(null, {
      notificationList,
      unread
    });
  }
}

const handlers = {
  markAllAsRead(notificationList) {
    notificationList.map((notify) => Meteor.call("notification/markOneAsRead", notify._id));
  },
  markOneAsRead(id) {
    Meteor.call("notification/markOneAsRead", id);
  }
};

registerComponent("Notification", Notification, [
  composeWithTracker(composer, false),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer, false),
  withProps(handlers)
)(Notification);
