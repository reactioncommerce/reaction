import React from "react";
import { composeWithTracker, merge } from "/lib/api/compose";
import { Meteor } from "meteor/meteor";
import { Notifications } from "/lib/collections";
import { NotificationComponent } from "../components";

const NotificationContainer = (props) => {
  return (
     <NotificationComponent {...props}/>
  );
};

function markAllAsRead(notificationList) {
  notificationList.map((notify) => {
    Meteor.call("notification/markOneAsRead", notify._id);
  });
}

function markOneAsRead(id) {
  Meteor.call("notification/markOneAsRead", id);
}

function composer(props, onData) {
  Meteor.subscribe("Notification", Meteor.userId());
  const notificationList = Notifications.find({}, { sort: { timeSent: -1 }, limit: 5 }).fetch();
  const unread = Notifications.find({ status: "unread" }).count();

  onData(null, {
    notificationList,
    unread,
    markAllAsRead,
    markOneAsRead
  });
}

export default merge(
  composeWithTracker(composer)
)(NotificationContainer);
