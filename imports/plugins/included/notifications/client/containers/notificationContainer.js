import React, { Component } from "react";
import { composeWithTracker, merge } from "/lib/api/compose";
import { Meteor } from "meteor/meteor";
import { Notifications } from "/lib/collections";
import { NotificationComponent } from "../components";

class NotificationContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <NotificationComponent {...this.props}/>
    );
  }
}

function markAllAsRead(notificationList) {
  notificationList.map((notify) => {
    Meteor.call("notification/markOneAsRead", notify._id);
  });
}

function markOneAsRead(id) {
  Meteor.call("notification/markOneAsRead", id);
}

function handleDelete(id) {
  Meteor.call("notification/delete", id);
}

function composer(props, onData) {
  Meteor.subscribe("Notification", Meteor.userId());
  const notificationList = Notifications.find({}, {sort: {timeSent: -1}, limit: 5}).fetch();
  const unread = Notifications.find({status: "unread"}).count();

  onData(null, {
    notificationList,
    unread,
    handleDelete,
    markAllAsRead,
    markOneAsRead
  });
}

export default merge(
  composeWithTracker(composer)
)(NotificationContainer);
