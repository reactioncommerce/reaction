import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Notifications } from "/lib/collections";
import { Reaction } from "/client/api";
import { NotificationRoute } from "../components";

const handlers = {
  markAllAsRead(notificationList) {
    notificationList.map((notify) => Meteor.call("notification/markOneAsRead", notify._id));
  },
  markOneAsRead(id) {
    Meteor.call("notification/markOneAsRead", id);
  }
};

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  if (Meteor.subscribe("Notification", Reaction.getUserId()).ready()) {
    const notificationList = Notifications.find({}, { sort: { timeSent: -1 } }).fetch();
    const unread = Notifications.find({ status: "unread" }).count();

    onData(null, {
      notificationList,
      unread
    });
  }
}

registerComponent("NotificationRoute", NotificationRoute, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(NotificationRoute);
